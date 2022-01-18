import { LoadedPCData } from "@paperclip-ui/utils";
import { useFrameContainer } from "../useFrameContainer";
import { useFrameStage } from "../useFrameStage";

export type UseFrameProps = {
  frameUri: string;
  frameIndex: number;
  style?: Record<string, any>;
  onLoad?: (mount: HTMLElement, data: LoadedPCData, index: number) => void;
  onUpdate?: (mount: HTMLElement, data: LoadedPCData, index: number) => void;
  fullscreen?: boolean;
};

export const useFrame = ({
  onLoad,
  onUpdate,
  fullscreen,
  frameUri,
  frameIndex
}: UseFrameProps) => {
  const content = useFrameStage({ frameUri, frameIndex, onUpdate });
  return useFrameContainer({ content, onLoad, fullscreen });
};
