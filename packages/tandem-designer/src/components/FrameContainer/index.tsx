import React, { useRef } from "react";
import { memo } from "react";
import { noop } from "lodash";
import { useFrame } from "../../hooks/useFrame";
import { LoadedPCData } from "@paperclip-ui/utils";

type FramesProps = {
  expandedFrameIndex?: number;
};

type FrameContainerProps = {
  style?: any;
  frameUri: string;
  frameIndex: number;
  fullscreen: boolean;
  onLoad?: (mount: HTMLElement, data: LoadedPCData) => void;
  onUpdate?: (mount: HTMLElement, data: LoadedPCData) => void;
};

export const FrameContainer = memo(
  ({
    frameUri,
    frameIndex,
    style = {},
    fullscreen,
    onLoad = noop,
    onUpdate = noop,
  }: FrameContainerProps) => {
    const { ref } = useFrame({
      fullscreen,
      onUpdate,
      onLoad,
      frameUri,
      frameIndex,
      showSlotPlaceholders: false,
    });

    return (
      <div style={{ width: "100%", height: "100%", ...style }} ref={ref} />
    );
  }
);

export type UseFrameContainerProps = {
  content: HTMLElement;
  onLoad?: () => void;
  fullscreen?: boolean;
};
