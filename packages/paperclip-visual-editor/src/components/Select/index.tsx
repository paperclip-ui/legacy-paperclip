import { useRef, useState } from "react";

export const useSelect = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const ref = useRef<HTMLElement>();

  const onBlur = () =>
    requestAnimationFrame(() => {
      if (!ref.current) {
        return;
      }

      if (ref.current.contains(document.activeElement)) {
        return;
      }

      setMenuVisible(false);
    });

  const onButtonClick = () => {
    setMenuVisible(true);
  };

  return {
    menuVisible,
    onButtonClick,
    onBlur,
    ref
  };
};
