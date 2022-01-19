import * as mime from "mime-types";
import { useCallback } from "react";
import { useAppStore } from "../useAppStore";

export const useFrameUrlResolver = () => {
  const {
    state: {
      designer: { resourceHost },
      shared: { documents },
    },
  } = useAppStore();

  return useCallback(
    (url) => {
      if (/^https?:\/\//.test(url)) {
        return url;
      }

      if (resourceHost) {
        return resourceHost + encodeURIComponent(url);
      }
      const content = documents[url];

      if (!content) {
        return url;
      }

      return typeof content === "string"
        ? `data:${mime.lookup(url)};utf8,${encodeURIComponent(content)}`
        : URL.createObjectURL(content);
    },
    [resourceHost, documents]
  );
};
