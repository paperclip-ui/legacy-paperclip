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
  fullscreen: boolean;
  onLoad?: () => void;
};

export const FrameContainer = memo(
  ({ frame, style = {}, fullscreen, onLoad = noop }: FrameContainerProps) => {
    const frameRef = useRef<HTMLDivElement>();

    useEffect(() => {
      if (frameRef.current) {
        const iframe = document.createElement("iframe");
        // addresses https://github.com/crcn/paperclip/issues/310
        Object.assign(iframe.style, {
          border: "none",
          background: "white",
          width: "100%",
          height: "100%",
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
              overflow: hidden;
            }
          </style>
        </head>
        <body>
        </body>
      </html>
    `;

        iframe.onload = () => {
          iframe.contentDocument.body.appendChild(frame.stage);

          // wait for the fonts to be loaded - will affect bounding rects
          (iframe.contentDocument as any).fonts.ready.then(() => {
            onLoad();
          });
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

    const syncOverflow = () => {
      const doc = (frameRef.current.children[0] as HTMLIFrameElement)
        ?.contentDocument;
      if (doc) {
        const overflow = fullscreen ? "scroll" : "hidden";
        doc.body.style.overflow = overflow;
        if (!fullscreen) {
          doc.body.scrollTop = 0;
          doc.body.scrollLeft = 0;
        }
      }
    };

    useEffect(syncOverflow, [fullscreen]);

    return (
      <div style={{ width: "100%", height: "100%", ...style }} ref={frameRef} />
    );
  }
);
