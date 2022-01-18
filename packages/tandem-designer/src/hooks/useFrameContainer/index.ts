import { LoadedPCData } from "@paperclip-ui/utils";
import { noop } from "lodash";
import { useEffect, useRef, useState } from "react";

export type UseFrameContainerProps = {
  content: HTMLElement;
  frameIndex: number;
  onLoad?: () => void;
  fullscreen?: boolean;
};

export const useFrameContainer = ({
  content,
  onLoad = noop,
  frameIndex,
  fullscreen
}: UseFrameContainerProps) => {
  const frameRef = useRef<HTMLDivElement>();
  const [internalContent, setInternalContent] = useState<HTMLElement>(null);

  useEffect(() => {
    setInternalContent(content);
  }, [content]);

  useEffect(() => {
    if (!frameRef.current || !internalContent) {
      return;
    }

    const existingIframe = frameRef.current.childElementCount
      ? (frameRef.current.childNodes[0] as HTMLIFrameElement)
      : null;

    if (internalContent === content) {
      return;
    }

    existingIframe?.remove();

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
  }, [frameRef, content, onLoad]);

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
