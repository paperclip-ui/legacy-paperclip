import { useFrameContainer } from "../useFrameContainer";
import { useFrameStage } from "../useFrameStage";

export type UseFrameProps = {
  frameUri: string;
  frameIndex: number;
  style?: Record<string, any>;
  onLoad?: () => void;
  fullscreen?: boolean;
};

export const useFrame = ({
  onLoad,
  fullscreen,
  frameUri,
  frameIndex
}: UseFrameProps) => {
  const content = useFrameStage({ frameUri, frameIndex });
  return useFrameContainer({ content, onLoad, fullscreen });
};
