import { LoadedPCData } from "@paperclip-ui/utils";
import { noop } from "lodash";
import { useCallback, useState } from "react";
import { useFrameContainer } from "../useFrameContainer";
import { useFrameMount } from "../useFrameMount";

export type UseFrameProps = {
  frameUri: string;
  frameIndex: number;
  style?: Record<string, any>;
  onLoad?: (mount: HTMLElement, data: LoadedPCData) => void;
  onUpdate?: (mount: HTMLElement, data: LoadedPCData) => void;
  fullscreen?: boolean;
  showSlotPlaceholders?: boolean;
};

export const useFrame = ({
  onLoad = noop,
  onUpdate = noop,
  fullscreen,
  frameUri,
  frameIndex,
  showSlotPlaceholders,
}: UseFrameProps) => {
  const [loaded, setLoaded] = useState(false);

  // update may be triggered before the frame mount is appended to the document body,
  // so we need to prohibit updates from being emitted _until_ the container iframe is ready
  const onUpdate2 = useCallback(
    (mount: HTMLElement, data: LoadedPCData) => {
      if (!loaded) {
        return;
      }
      onUpdate(mount, data);
    },
    [frameIndex, frameUri, onUpdate]
  );

  const { mount, loadedPCData } = useFrameMount({
    showSlotPlaceholders,
    frameUri,
    frameIndex,
    onUpdate: onUpdate2,
  });

  // once the container loads, _then_ we can fire subsequent updates
  const onLoad2 = useCallback(() => {
    onLoad(mount, loadedPCData);
    setLoaded(true);
  }, [mount, loadedPCData]);

  return useFrameContainer({ mount, onLoad: onLoad2, fullscreen });
};
