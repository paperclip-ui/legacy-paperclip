import React, { useCallback } from "react";
import { getFrameBounds } from "@paperclip-ui/web-renderer";
import { memo, useMemo } from "react";
import { VirtualElement, VirtualText, LoadedPCData } from "@paperclip-ui/utils";
import * as styles from "./index.pc";
import { FrameContainer } from "../../../../FrameContainer";

type FrameProps = {
  frameUri: string;
  frameIndex: number;
  expanded: boolean;
  preview: VirtualText | VirtualElement;
  onLoad: (
    mount: HTMLElement,
    data: LoadedPCData,
    frameUri: string,
    frameIndex: number
  ) => void;
  onUpdate: (
    mount: HTMLElement,
    data: LoadedPCData,
    frameUri: string,
    frameIndex: number
  ) => void;
};

export const Frame = memo(
  ({
    frameUri,
    frameIndex,
    preview,
    expanded,
    onLoad,
    onUpdate,
  }: FrameProps) => {
    if (!preview) {
      return null;
    }

    const onLoad2 = useCallback(
      (mount: HTMLElement, data: LoadedPCData) => {
        onLoad(mount, data, frameUri, frameIndex);
      },
      [frameUri, frameIndex, onLoad]
    );

    const onUpdate2 = useCallback(
      (mount: HTMLElement, data: LoadedPCData) => {
        onUpdate(mount, data, frameUri, frameIndex);
      },
      [frameUri, frameIndex, onUpdate]
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
          position: "absolute",
        };
      }

      return {
        width: bounds.width,
        height: bounds.height,
        left: bounds.x,
        top: bounds.y,
        position: "absolute",
      };
    }, [preview.annotations, expanded]) as any;

    return (
      <styles.Frame style={frameStyle}>
        <FrameContainer
          frameUri={frameUri}
          frameIndex={frameIndex}
          fullscreen={expanded}
          onLoad={onLoad2}
          onUpdate={onUpdate2}
        />
      </styles.Frame>
    );
  }
);
