import React, { useRef } from "react";
import { Frame } from "@paperclip-ui/web-renderer";
import { memo, useEffect } from "react";
import { noop } from "lodash";
import { useFrameContainer } from "../../hooks/useFrameContainer";
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
  onLoad?: (mount: HTMLElement, data: LoadedPCData, index: number) => void;
};

export const FrameContainer = memo(
  ({
    frameUri,
    frameIndex,
    style = {},
    fullscreen,
    onLoad = noop
  }: FrameContainerProps) => {
    const { ref } = useFrame({
      fullscreen,
      onLoad,
      frameUri,
      frameIndex
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
