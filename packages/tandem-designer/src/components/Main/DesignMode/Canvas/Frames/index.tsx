import React, { useCallback, useLayoutEffect, useState } from "react";
import {
  Frame as Frame2,
  FramesRenderer,
  FramesRendererState,
  getFrameBounds,
  getFrameVirtualNode
} from "@paperclip-ui/web-renderer";
import { memo, useEffect, useMemo } from "react";
import mime from "mime-types";
import {
  engineDelegateEventsHandled,
  rectsCaptured,
  rendererMounted,
  rendererUnounted
} from "../../../../../actions";
import { useAppStore } from "../../../../../hooks/useAppStore";
import {
  computeVirtScriptObject,
  VirtualElement,
  VirtualNode,
  VirtualText,
  NodeAnnotations,
  LoadedData,
  EngineDelegateEvent,
  LoadedPCData,
  VirtualNodeKind,
  VirtualFrame
} from "@paperclip-ui/utils";
import * as styles from "./index.pc";
import { render } from "react-dom";
import { FrameContainer } from "../../../../FrameContainer";
import { debounce, identity } from "lodash";
import { AppState, isExpanded } from "../../../../../state";
import { ImmutableStore } from "@paperclip-ui/common";
import { UrlResolver } from "@paperclip-ui/web-renderer/lib/native-renderer";
import { useFrameUrlResolver } from "../../../../../hooks/useFrameUrlResolver";
import { useSelector } from "react-redux";

type FramesProps = {
  expandedFrameIndex?: number;
};

export const Frames = memo(({ expandedFrameIndex }: FramesProps) => {
  const { state } = useAppStore();
  const { frames, onFrameLoaded } = useFrames({
    fileUri: state.designer.ui.query.canvasFile,
    shouldCollectRects: true
  });

  return (
    <>
      {frames.map((frame, i) => {
        return (
          <Frame
            key={i}
            onLoad={onFrameLoaded}
            expanded={expandedFrameIndex === i}
            frameUri={state.designer.ui.query.canvasFile}
            frameIndex={i}
            preview={frame as VirtualFrame}
          />
        );
      })}
    </>
  );
});

type UseFrames2Props = {
  version: number;
  fileData: Record<string, LoadedPCData>;
  shouldCollectRects: boolean;
};

type FrameControllerState = {} & FramesRendererState;

class FrameController {
  private _store: ImmutableStore<FrameControllerState>;
  readonly id: string;
  private _disposed: boolean;
  private _renderer: FramesRenderer;
  private _initialized: boolean;

  constructor(
    targetUri: string,
    resolveUrl: (value: string) => string,
    readonly dispatch: any,
    public shouldCollectRects: boolean,
    connectState: (state: FrameControllerState) => void
  ) {
    this._store = new ImmutableStore(
      { frames: [], uri: targetUri },
      connectState
    );
    this._renderer = new FramesRenderer(
      targetUri,
      resolveUrl,
      null,
      this._onframeControllerStateChange
    );
    this.id = `${Date.now()}.${Math.random()}`;
    this.dispatch(rendererMounted({ id: this.id }));
    if (shouldCollectRects) {
      this, window.addEventListener("resize", this._onWindowResize);
    }
  }
  initialize(data: LoadedPCData) {
    this._initialized = true;
    this._renderer.initialize(data);
  }
  isInitialized() {
    return this._initialized;
  }
  isMounted(mountedRendererIds: string[]) {
    return mountedRendererIds.includes(this.id);
  }
  setUrlResolver(resolver: UrlResolver) {
    this._renderer.setUrlResolver(resolver);
  }
  _onframeControllerStateChange = (state: FramesRendererState) => {
    this._store.update(newState => Object.assign(newState, state));
  };
  updatePreview(preview: VirtualNode) {
    this._renderer.setPreview(preview);
    this.collectRects();
  }
  dispose() {
    this._disposed = true;
    this, window.removeEventListener("resize", this._onWindowResize);
    this.dispatch(rendererUnounted({ id: this.id }));
  }
  handleEvents = (events: EngineDelegateEvent[] = [], preview: VirtualNode) => {
    // Happens if window opens with error state
    if (!preview) {
      console.error(`Cannot handle events without preview!`);
      return;
    }
    if (!events.length) {
      return;
    }
    events.forEach(this._renderer.handleEngineDelegateEvent);
    this.updatePreview(preview);
    this.dispatch(
      engineDelegateEventsHandled({ id: this.id, count: events.length })
    );
  };
  private _onWindowResize = () => {
    this.collectRects();
  };

  // This is really f'n slow, so we need to debounce this
  // so that it doesn't hold things up like color pickers
  collectRects = debounce(
    () => {
      if (!this.shouldCollectRects || this._disposed) {
        return;
      }
      const rects = this._renderer.getRects();
      this.dispatch(rectsCaptured(rects));
    },
    100,
    { leading: false }
  );
}

type FrameInfo = {
  preview: any;
  frames: Frame2[];
};

type MultiFrameControllerState = {
  frames: Record<string, FrameInfo>;
};

const INITIAL_FRAME_CONTROLLER_STATE: MultiFrameControllerState = {
  frames: {}
};

class MultiFrameController {
  private _store: ImmutableStore<MultiFrameControllerState>;
  private _controllers: Record<string, FrameController>;

  constructor(
    private _dispatch: any,
    private _shouldCollectRects: boolean,
    private _urResolver: any,
    connectState: (state: MultiFrameControllerState) => void
  ) {
    this._controllers = {};
    this._store = new ImmutableStore(
      INITIAL_FRAME_CONTROLLER_STATE,
      connectState
    );
  }

  dispose() {
    for (const controller of Object.values(this._controllers)) {
      controller.dispose();
    }
  }

  updateFileData(
    fileData: Record<string, LoadedPCData>,
    currentEngineEvents: Record<string, EngineDelegateEvent[]>,
    mountedRendererIds: string[]
  ) {
    for (const fileUri in fileData) {
      let controller: FrameController = this._controllers[fileUri];

      if (!controller) {
        controller = this._controllers[fileUri] = new FrameController(
          fileUri,
          this._urResolver,
          this._dispatch,
          this._shouldCollectRects,
          this._onFrameControllerChange
        );
      }

      if (controller.isMounted(mountedRendererIds)) {
        if (!controller.isInitialized()) {
          controller.initialize(fileData[fileUri]);
        }

        if (currentEngineEvents[controller.id]) {
          controller.handleEvents(
            currentEngineEvents[controller.id],
            fileData[fileUri].preview
          );
        }
      }
    }

    for (const fileUri in this._controllers) {
      if (!fileData[fileUri]) {
        this._controllers[fileUri].dispose();
        delete this._controllers[fileUri];
      }
    }
  }

  private _onFrameControllerChange = (rendererState: FrameControllerState) => {
    this._store.update(newState => {
      newState.frames[rendererState.uri] = {
        frames: rendererState.frames,
        preview: rendererState.preview
      };
    });
  };
}

export const useMultipleFrames = ({
  version,
  fileData,
  shouldCollectRects
}: UseFrames2Props) => {
  const [
    multiRenderer,
    setMultiRenderer
  ] = useState<MultiFrameController | null>(null);
  const [multiFrameState, setMultiFrameState] = useState<
    MultiFrameControllerState
  >(INITIAL_FRAME_CONTROLLER_STATE);
  const { dispatch, state } = useAppStore();
  const resolveUrl = useFrameUrlResolver();

  useEffect(() => {
    const renderer = new MultiFrameController(
      dispatch,
      shouldCollectRects,
      resolveUrl,
      setMultiFrameState
    );
    setMultiRenderer(renderer);
    return () => {
      renderer.dispose();
    };
  }, [version]);

  useEffect(() => {
    if (multiRenderer) {
      multiRenderer.updateFileData(
        fileData,
        state.designer.currentEngineEvents,
        state.designer.mountedRendererIds
      );
    }
  }, [
    multiRenderer,
    fileData,
    state.designer.currentEngineEvents,
    state.designer.mountedRendererIds
  ]);

  return multiFrameState;
};

type UseFramesProps = {
  fileUri: string;
  shouldCollectRects: boolean;
};

const useFrames = ({ fileUri, shouldCollectRects = true }: UseFramesProps) => {
  const state = useSelector(identity) as AppState;
  const pcData: LoadedPCData = state.designer.allLoadedPCFileData[
    state.designer.ui.query.canvasFile
  ] as LoadedPCData;

  const onFrameLoaded = (
    mount: HTMLElement,
    data: LoadedPCData,
    index: number
  ) => {
    console.log("FRAME LOADED", mount, data, index);
  };

  if (!pcData) {
    return { frames: [], onFrameLoaded };
  }

  const frames =
    pcData.preview.kind === VirtualNodeKind.Fragment
      ? pcData.preview.children
      : [pcData.preview];

  return { frames, onFrameLoaded };
};

export const useFrames2 = ({
  fileUri,
  shouldCollectRects = true
}: UseFramesProps) => {
  const { state, dispatch } = useAppStore();
  const [frameControllerState, setFrameControllerState] = useState<
    FrameControllerState
  >({
    uri: fileUri,
    frames: []
  });
  const [controller, setController] = useState<FrameController>();
  const isMounted = Boolean(
    controller?.isMounted(state.designer.mountedRendererIds)
  );

  const frameData = state.designer.allLoadedPCFileData[fileUri] as LoadedPCData;

  const resolveUrl = useFrameUrlResolver();

  useEffect(() => {
    const renderer = new FrameController(
      fileUri,
      resolveUrl,
      dispatch,
      shouldCollectRects,
      setFrameControllerState
    );

    setController(renderer);
    return () => {
      renderer.dispose();
    };
  }, [fileUri, shouldCollectRects]);

  useEffect(() => {
    if (isMounted && frameData) {
      controller.initialize(frameData);
    }
  }, [isMounted, controller, !!frameData, state.designer.pcFileDataVersion]);

  useEffect(() => {
    if (!controller) {
      return;
    }
    controller.setUrlResolver(resolveUrl);
  }, [resolveUrl]);

  const onFrameLoaded = useCallback(() => {
    if (!isMounted) {
      return;
    }
    controller.collectRects();
  }, [isMounted, controller]);

  useLayoutEffect(() => {
    if (!isMounted) {
      return;
    }

    if (state.designer.currentEngineEvents[controller.id]?.length) {
      controller.handleEvents(
        state.designer.currentEngineEvents[controller.id],
        frameData?.preview
      );
    } else if (frameData?.preview) {
      // need to update preview in case frame bounds change
      controller.updatePreview(frameData.preview);
    }
  }, [
    controller,
    isMounted,
    isExpanded(state.designer),
    state.designer.currentEngineEvents,
    state.designer.canvas.size,
    frameData?.preview
  ]);

  return {
    ...frameControllerState,
    onFrameLoaded
  };
};

type FrameProps = {
  frameUri: string;
  frameIndex: number;
  expanded: boolean;
  preview: VirtualText | VirtualElement;
  onLoad: (mount: HTMLElement, index: number) => void;
};

const Frame = memo(
  ({ frameUri, frameIndex, preview, expanded, onLoad }: FrameProps) => {
    if (!preview) {
      return null;
    }

    const onLoad2 = useCallback(
      (mount: HTMLElement) => {
        onLoad(mount, frameIndex);
      },
      [frameUri, frameIndex, onLoad]
    );

    const frameStyle = useMemo(() => {
      const bounds = getFrameBounds(preview);

      if (expanded) {
        return {
          width: `100%`,
          height: `100%`,

          // necessary since client rects include frame position
          left: bounds.x,
          top: bounds.y,
          zIndex: 1,
          position: "absolute"
        };
      }

      return {
        width: bounds.width,
        height: bounds.height,
        left: bounds.x,
        top: bounds.y,
        position: "absolute"
      };
    }, [preview.annotations, expanded]) as any;

    return (
      <styles.Frame style={frameStyle}>
        <FrameContainer
          frameUri={frameUri}
          frameIndex={frameIndex}
          fullscreen={expanded}
          onLoad={onLoad2}
        />
      </styles.Frame>
    );
  }
);
