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

  const onButtonClick = event => {
    setMenuVisible(!menuVisible);
  };

  const close = () => {
    setMenuVisible(false);
  };

  const onClick = event => {
    // there might be click handlers for parents
    event.stopPropagation();
  };

  return {
    close,
    onClick,
    menuVisible,
    onButtonClick,
    onBlur,
    ref
  };
};
