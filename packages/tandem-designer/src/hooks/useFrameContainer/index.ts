import { noop } from "lodash";
import { useEffect, useRef } from "react";

export type UseFrameContainerProps = {
  content: HTMLElement;
  onLoad?: () => void;
  fullscreen?: boolean;
};

export const useFrameContainer = ({
  content,
  onLoad = noop,
  fullscreen
}: UseFrameContainerProps) => {
  const frameRef = useRef<HTMLDivElement>();

  useEffect(() => {
    if (frameRef.current && content) {
      const iframe = document.createElement("iframe");
      // addresses https://github.com/paperclipui/paperclip/issues/310
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
            overflow: hidden;
          }
        </style>
      </head>
      <body>
      </body>
    </html>
  `;

      iframe.onload = () => {
        iframe.contentDocument.body.appendChild(content);

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
  }, [frameRef, content]);

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

  return { ref: frameRef };
};
