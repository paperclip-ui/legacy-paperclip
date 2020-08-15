import React from "react";
import * as styles from "./index.pc";
import { Preview } from "./Preview";
import { Tools } from "./Tools";

export const Canvas = React.memo(() => {
  return (
    <styles.Canvas>
      <Tools />
      <Preview />
    </styles.Canvas>
  );
});
