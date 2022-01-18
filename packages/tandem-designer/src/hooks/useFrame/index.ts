import { LoadedPCData } from "@paperclip-ui/utils";
import { useCallback } from "react";
import { useFrameContainer } from "../useFrameContainer";
import { useFrameStage } from "../useFrameStage";

export type UseFrameProps = {
  frameUri: string;
  frameIndex: number;
  style?: Record<string, any>;
  onLoad?: (mount: HTMLElement, data: LoadedPCData) => void;
  onUpdate?: (mount: HTMLElement, data: LoadedPCData) => void;
  fullscreen?: boolean;
};

export const useFrame = ({
  onLoad,
  onUpdate,
  fullscreen,
  frameUri,
  frameIndex
}: UseFrameProps) => {
  const { mount, loadedPCData } = useFrameStage({
    frameUri,
    frameIndex,
    onUpdate
  });
  const onLoad2 = useCallback(() => {
    onLoad(mount, loadedPCData);
  }, [mount, loadedPCData]);
  return useFrameContainer({ mount, onLoad: onLoad2, fullscreen });
};
