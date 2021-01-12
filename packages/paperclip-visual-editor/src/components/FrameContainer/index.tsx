import React, { useRef } from "react";
import { Frame } from "paperclip-web-renderer";
import { memo, useEffect } from "react";
import { noop } from "lodash";

type FramesProps = {
  expandedFrameIndex?: number;
};

type FrameContainerProps = {
  style?: any;
  frame: Frame;
  onLoad?: () => void;
};

export const FrameContainer = memo(
  ({ frame, style = {}, onLoad = noop }: FrameContainerProps) => {
    const frameRef = useRef<HTMLDivElement>();

    useEffect(() => {
      if (frameRef.current) {
        const iframe = document.createElement("iframe");
        // addresses https://github.com/crcn/paperclip/issues/310
        Object.assign(iframe.style, {
          border: "none",
          background: "white",
          width: "100%",
          height: "100%"
        });
        iframe.srcdoc = `
      <!doctype html>
      <html>
        <head>
          <style>
            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
            }
          </style>
        </head>
        <body>
        </body>
      </html>
    `;

        iframe.onload = () => {
          iframe.contentDocument.body.appendChild(frame.stage);
          onLoad();
        };
        frameRef.current.appendChild(iframe);
      }

      return () => {
        // remove iframe
        if (frameRef.current && frameRef.current.childElementCount) {
          frameRef.current.removeChild(frameRef.current.childNodes[0]);
        }
      };
    }, [frameRef, frame.stage]);

    return (
      <div style={{ width: "100%", height: "100%", ...style }} ref={frameRef} />
    );
  }
);
