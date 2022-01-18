import { LoadedPCData, memoize } from "@paperclip-ui/utils";
import { patchFrame, renderFrame } from "@paperclip-ui/web-renderer";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AppState } from "../../state";
import { useFrameUrlResolver } from "../useFrameUrlResolver";

type UseFrameStageProps = {
  frameUri: string;
  frameIndex: number;
};

export const useFrameStage = ({ frameUri, frameIndex }: UseFrameStageProps) => {
  const fileContent = useSelector(getFileContent(frameUri)) as LoadedPCData;

  const [state, setState] = useState<
    UseFrameStageProps & {
      fileContent: LoadedPCData;
      stage: HTMLElement;
    }
  >();

  const resolveUrl = useFrameUrlResolver();

  useEffect(() => {
    let stage;
    if (
      state?.stage &&
      frameUri === state.frameUri &&
      frameIndex === state.frameIndex
    ) {
      stage = state.stage;
      patchFrame(state.stage, frameIndex, state.fileContent, fileContent, {
        domFactory: document,
        resolveUrl
      });
    } else {
      stage = renderFrame(fileContent, frameIndex, {
        domFactory: document,
        resolveUrl
      });
    }
    setState({ stage, frameUri, frameIndex, fileContent });
  }, [frameUri, frameIndex, fileContent]);

  return state?.stage;
};

const getFileContent = memoize((uri: string) => (state: AppState) =>
  state.designer.allLoadedPCFileData[uri]
);
