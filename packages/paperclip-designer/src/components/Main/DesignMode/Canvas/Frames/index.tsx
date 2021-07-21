import React, { useCallback, useLayoutEffect, useState } from "react";
import {
  Frame,
  FramesRenderer,
  FramesRendererState,
  getFrameBounds,
  getFrameVirtualNode
} from "paperclip-web-renderer";
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
  computeVirtJSObject,
  VirtualElement,
  VirtualNode,
  VirtualText,
  NodeAnnotations,
  LoadedData,
  EngineDelegateEvent,
  LoadedPCData
} from "paperclip-utils";
import * as styles from "./index.pc";
import { render } from "react-dom";
import { FrameContainer } from "../../../../FrameContainer";
import { debounce } from "lodash";
import { isExpanded } from "../../../../../state";
import produce from "immer";

type FramesProps = {
  expandedFrameIndex?: number;
};

export const Frames = memo(({ expandedFrameIndex }: FramesProps) => {
  const { state } = useAppStore();
  const { renderer, preview, onFrameLoaded } = useFrames({
    fileUri: state.designer.ui.query.canvasFile,
    shouldCollectRects: true
  });

  if (!preview || !renderer) {
    return null;
  }

  return (
    <>
      {renderer.getState().frames.map((frame, i) => {
        const framePreview = getFrameVirtualNode(
          frame,
          renderer.immutableFrames,
          preview
        );

        return (
          <Frame
            key={i}
            onLoad={onFrameLoaded}
            expanded={expandedFrameIndex === i}
            frame={frame}
            preview={framePreview}
          />
        );
      })}
    </>
  );
});

type UseFrames2Props = {
  fileData: Record<string, LoadedPCData>;
  shouldCollectRects: boolean;
};

class FrameController {
  readonly id: string;
  private _disposed: boolean;
  constructor(
    readonly renderer: FramesRenderer,
    readonly dispatch: any,
    public shouldCollectRects: boolean,
    readonly loadedData?: LoadedPCData
  ) {
    this.id = `${Date.now()}.${Math.random()}`;
    this.dispatch(rendererMounted({ id: this.id }));
    if (shouldCollectRects) {
      this, window.addEventListener("resize", this._onWindowResize);
    }
    if (loadedData) {
      renderer.initialize(loadedData);
    }
  }
  updatePreview(preview: VirtualNode) {
    this.renderer.setPreview(preview);
    this.collectRects();
  }
  dispose() {
    this._disposed = true;
    this, window.removeEventListener("resize", this._onWindowResize);
    this.dispatch(rendererUnounted({ id: this.id }));
  }
  handleEvents = (events: EngineDelegateEvent[] = [], preview: VirtualNode) => {
    if (!events.length) {
      return;
    }
    events.forEach(this.renderer.handleEngineDelegateEvent);
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
      const rects = this.renderer.getRects();
      this.dispatch(rectsCaptured(rects));
    },
    100,
    { leading: false }
  );
}

type FrameInfo = {
  preview: any;
  frames: Frame[];
};

type MultiFrameControllerState = {
  frames: Record<string, FrameInfo>;
};

const INITIAL_FRAME_CONTROLLER_STATE: MultiFrameControllerState = {
  frames: {}
};

class MultiFrameController {
  private _state: MultiFrameControllerState;

  private _fileData: Record<string, LoadedPCData>;
  private _renderers: Record<string, FrameController> = {};
  public onChange: any;

  constructor(
    private _dispatch: any,
    private _shouldCollectRects: boolean,
    private _urResolver: any
  ) {
    this._state = {
      frames: {}
    };
  }

  updateFileData(fileData: Record<string, LoadedPCData>) {
    this._renderers = { ...this._renderers };
    for (const fileUri in fileData) {
      if (this._renderers[fileUri]) {
        continue;
      }

      const renderer = new FramesRenderer(
        fileUri,
        this._urResolver,
        null,
        this._onFramesRendererChanged
      );

      this._renderers[fileUri] = new FrameController(
        renderer,
        this._dispatch,
        this._shouldCollectRects,
        fileData[fileUri]
      );
    }

    for (const fileUri in this._renderers) {
      if (!fileData[fileUri]) {
        this._renderers[fileUri].dispose();
        delete this._renderers[fileUri];
      }
    }
  }

  getState() {
    return this._state;
  }

  private _onFramesRendererChanged = (rendererState: FramesRendererState) => {
    this._updateState(newState => {
      newState.frames[rendererState.uri] = {
        frames: rendererState.frames,
        preview: rendererState.preview
      };
    });
  };

  private _updateState = (
    updater: (newState: MultiFrameControllerState) => void
  ) => {
    this._state = produce(this._state, updater);
    this.onChange(this._state);
  };
}

export const useMultipleFrames = ({
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
  const { dispatch } = useAppStore();
  const resolveUrl = useUrlResolver();
  useEffect(() => {
    const multiRenderer = new MultiFrameController(
      dispatch,
      shouldCollectRects,
      resolveUrl
    );
    multiRenderer.onChange = setMultiFrameState;
    setMultiRenderer(multiRenderer);
  }, []);

  useEffect(() => {
    if (!multiRenderer) {
      return;
    }

    multiRenderer.updateFileData(fileData);
  }, [multiRenderer, fileData]);

  return multiFrameState;
};

// export const useMultipleFrames3 = ({
//   fileData,
//   shouldCollectRects
// }: UseFrames2Props) => {
//   const [renderers, setRenderers] = useState<Record<string, FrameController>>(
//     {}
//   );
//   const { state, dispatch } = useAppStore();
//   const resolveUrl = useUrlResolver();

//   useEffect(() => {
//     for (const uri in renderers) {
//       renderers[uri].renderer.urlResolver = resolveUrl;
//     }
//   }, [resolveUrl]);

//   useLayoutEffect(() => {
//     for (const fileUri in renderers) {
//       const renderer = renderers[fileUri];
//       renderer.collectRects();
//     }
//   }, [renderers, isExpanded(state.designer), state.designer.canvas.size]);

//   useEffect(() => {
//     for (const fileUri in renderers) {
//       const frameData = state.designer.allLoadedPCFileData[
//         fileUri
//       ] as LoadedPCData;
//       const renderer = renderers[fileUri];
//       renderer.handleEvents(
//         state.designer.currentEngineEvents[renderer.id],
//         frameData?.preview
//       );
//     }
//   }, [renderers, state.designer.currentEngineEvents]);

//   return useMemo(
//     () =>
//       Object.keys(renderers).map(uri => {
//         const renderer = renderers[uri];

//         return {
//           renderer: renderer.renderer,
//           onFrameLoaded: renderer.collectRects,
//           preview: renderer.renderer.getPreview()
//         };
//       }, {}),
//     [renderers]
//   );
// };

// export const useMultipleFrames3 = ({
//   fileData,
//   shouldCollectRects
// }: UseFrames2Props) => {
//   const [renderers, setRenderers] = useState<Record<string, FrameController>>(
//     {}
//   );
//   const { state, dispatch } = useAppStore();
//   const resolveUrl = useUrlResolver();

//   useEffect(() => {
//     const newRenderers = { ...renderers };
//     for (const fileUri in fileData) {
//       if (newRenderers[fileUri]) {
//         continue;
//       }

//       const renderer = new FramesRenderer(fileUri, resolveUrl);

//       newRenderers[fileUri] = new FrameController(
//         renderer,
//         dispatch,
//         shouldCollectRects,
//         fileData[fileUri]
//       );
//     }

//     for (const fileUri in newRenderers) {
//       if (!fileData[fileUri]) {
//         newRenderers[fileUri].dispose();
//         delete newRenderers[fileUri];
//       }
//     }

//     setRenderers(newRenderers);
//   }, [fileData]);

//   useEffect(() => {
//     for (const uri in renderers) {
//       renderers[uri].renderer.urlResolver = resolveUrl;
//     }
//   }, [resolveUrl]);

//   useLayoutEffect(() => {
//     for (const fileUri in renderers) {
//       const renderer = renderers[fileUri];
//       renderer.collectRects();
//     }
//   }, [renderers, isExpanded(state.designer), state.designer.canvas.size]);

//   useEffect(() => {
//     for (const fileUri in renderers) {
//       const frameData = state.designer.allLoadedPCFileData[
//         fileUri
//       ] as LoadedPCData;
//       const renderer = renderers[fileUri];
//       renderer.handleEvents(
//         state.designer.currentEngineEvents[renderer.id],
//         frameData?.preview
//       );
//     }
//   }, [renderers, state.designer.currentEngineEvents]);

//   return useMemo(
//     () =>
//       Object.keys(renderers).map(uri => {
//         const renderer = renderers[uri];

//         return {
//           renderer: renderer.renderer,
//           onFrameLoaded: renderer.collectRects,
//           preview: renderer.renderer.getPreview()
//         };
//       }, {}),
//     [renderers]
//   );
// };

type UseFramesProps = {
  fileUri: string;
  shouldCollectRects: boolean;
};
const useUrlResolver = () => {
  const {
    state: {
      designer: { resourceHost },
      shared: { documents }
    }
  } = useAppStore();

  return useCallback(
    url => {
      if (/^https?:\/\//.test(url)) {
        return url;
      }

      if (resourceHost) {
        return resourceHost + encodeURIComponent(url);
      }
      const content = documents[url];

      if (!content) {
        return url;
      }

      return typeof content === "string"
        ? `data:${mime.lookup(url)};utf8,${encodeURIComponent(content)}`
        : URL.createObjectURL(content);
    },
    [resourceHost, documents]
  );
};

export const useFrames = ({
  fileUri,
  shouldCollectRects = true
}: UseFramesProps) => {
  const { state, dispatch } = useAppStore();
  const [renderer, setRenderer] = useState<FrameController>();

  const frameData = state.designer.allLoadedPCFileData[fileUri] as LoadedPCData;

  const resolveUrl = useUrlResolver();

  useEffect(() => {
    const renderer = new FrameController(
      new FramesRenderer(fileUri, resolveUrl),
      dispatch,
      shouldCollectRects,
      frameData
    );
    setRenderer(renderer);
    return () => {
      renderer.dispose();
    };
  }, [fileUri, shouldCollectRects, !!frameData]);

  useEffect(() => {
    if (!renderer) {
      return;
    }
    renderer.renderer.urlResolver = resolveUrl;
  }, [resolveUrl]);

  const onFrameLoaded = useCallback(() => {
    if (!renderer) {
      return;
    }
    renderer.collectRects();
  }, [renderer]);

  useLayoutEffect(() => {
    if (!renderer) {
      return;
    }

    if (state.designer.currentEngineEvents[renderer.id]?.length) {
      renderer.handleEvents(
        state.designer.currentEngineEvents[renderer.id],
        frameData?.preview
      );
    } else if (frameData?.preview) {
      // need to update preview in case frame bounds change
      renderer.updatePreview(frameData.preview);
    }
  }, [
    renderer,
    isExpanded(state.designer),
    state.designer.currentEngineEvents,
    state.designer.canvas.size,
    frameData?.preview
  ]);

  return {
    renderer: renderer?.renderer,
    preview: frameData?.preview,
    onFrameLoaded
  };
};

type FrameProps = {
  frame: Frame;
  expanded: boolean;
  preview: VirtualText | VirtualElement;
  onLoad: () => void;
};

const Frame = memo(({ frame, preview, expanded, onLoad }: FrameProps) => {
  if (!preview) {
    return null;
  }

  const annotations: NodeAnnotations =
    (preview.annotations && computeVirtJSObject(preview.annotations)) ||
    ({} as any);

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
      <FrameContainer frame={frame} fullscreen={expanded} onLoad={onLoad} />
    </styles.Frame>
  );
});
