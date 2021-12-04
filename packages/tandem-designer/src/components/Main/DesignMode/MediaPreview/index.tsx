import React from "react";
import * as styles from "./index.pc";

export type MediaPreviewProps = {
  src: string;
};

export const MediaPreview = ({ src }: MediaPreviewProps) => {
  return (
    <styles.default>
      <img
        src={
          window.location.protocol +
          "//" +
          window.location.host +
          "/file/" +
          encodeURIComponent(src)
        }
      />
    </styles.default>
  );
};
