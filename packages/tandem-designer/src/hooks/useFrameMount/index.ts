import { LoadedPCData, memoize } from "@paperclip-ui/utils";
import { patchFrame, renderFrame } from "@paperclip-ui/web-renderer";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AppState } from "../../state";
import { useFrameUrlResolver } from "../useFrameUrlResolver";

type UseFrameStageOuterProps = {
  onUpdate: (mount: HTMLElement, data: LoadedPCData) => void;
} & UseFrameStageInnerProps;

type UseFrameStageInnerProps = {
  frameUri: string;
  frameIndex: number;
  showSlotPlaceholders?: boolean;
};

export const useFrameMount = ({
  frameUri,
  frameIndex,
  showSlotPlaceholders,
  onUpdate,
}: UseFrameStageOuterProps) => {
  const loadedPCData = useSelector(getFileContent(frameUri)) as LoadedPCData;

  const [state, setState] = useState<
    UseFrameStageInnerProps & {
      loadedPCData: LoadedPCData;
      mount: HTMLElement;
    }
  >();

  const resolveUrl = useFrameUrlResolver();

  useEffect(() => {
    // this will happen if onUpdate changes
    if (
      state?.frameIndex === frameIndex &&
      state?.frameUri === frameUri &&
      state?.loadedPCData === loadedPCData
    ) {
      return;
    }

    let mount;
    if (
      state?.mount &&
      frameUri === state.frameUri &&
      frameIndex === state.frameIndex
    ) {
      mount = state.mount;
      patchFrame(state.mount, frameIndex, state.loadedPCData, loadedPCData, {
        showSlotPlaceholders,
        domFactory: document,
        resolveUrl,
      });
    } else {
      mount = renderFrame(loadedPCData, frameIndex, {
        showSlotPlaceholders,
        domFactory: document,
        resolveUrl,
      });
    }
    onUpdate(mount, loadedPCData);
    setState({ mount, frameUri, frameIndex, loadedPCData });
  }, [frameUri, frameIndex, loadedPCData, onUpdate]);

  return {
    mount: state?.mount,
    loadedPCData: state?.loadedPCData,
  };
};

const getFileContent = memoize(
  (uri: string) => (state: AppState) => state.designer.allLoadedPCFileData[uri]
);
