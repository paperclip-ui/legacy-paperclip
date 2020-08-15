import React from "react";
import * as styles from "./index.pc";
import { Preview } from "./Preview";
import { Tools } from "./Tools";
import { useAppStore } from "../../../hooks/useAppStore";

export const Canvas = React.memo(() => {
  const {
    state: {
      canvas: { transform }
    }
  } = useAppStore();
  return (
    <styles.Canvas>
      <Tools />
      <Preview transform={transform} />
    </styles.Canvas>
  );
});
