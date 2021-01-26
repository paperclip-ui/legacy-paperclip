import React, { memo, useMemo, useRef, useState } from "react";
import * as styles from "./index2.pc";

export { styles };

export type MenuProps = {
  button: any;
  renderMenu: () => any;
};

const OPTIONS_WIDTH = 250;

export enum MenuPosition {
  Left = "left",
  Center = "center",
  Right = "right",
  Auto = "auto"
}

export const useMenu = () => {
  const [showOptions, setShowOptions] = useState(false);
  const ref = useRef<HTMLElement>();
  const onButtonClick = () => {
    setShowOptions(!showOptions);
  };
  const onButtonBlur = () => {
    // focus is moved to temporarily to body before switching - observed
    // natively
    requestAnimationFrame(() => {
      if (ref.current && ref.current.contains(document.activeElement)) {
        return;
      }
      setShowOptions(false);
    });
  };

  // const optionsStyle = useMemo(() => {
  //   if (!ref.current || !showOptions) {
  //     return {}
  //   }

  //   // const buttonBox = ref.current.getBoundingClientRect();

  //   const style = {
  //     position: "absolute",
  //     top: "100%",
  //     left: undefined
  //   };

  //   if (position === MenuPosition.Left) {
  //     style.left = 0;
  //   }

  //   return style;
  // }, [ref.current, showOptions]);

  const close = () => {
    setShowOptions(false);
  };

  return {
    ref,
    showOptions,
    onButtonClick,
    onButtonBlur,
    close
  };
};
