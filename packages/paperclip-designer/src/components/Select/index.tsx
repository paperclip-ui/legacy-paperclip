import { useRef, useState } from "react";

export const useSelect = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuStyle, setMenuStyle] = useState<any>();
  const ref = useRef<HTMLElement>();

  const onBlur = () => {
    requestAnimationFrame(() => {
      if (!ref.current) {
        return;
      }

      if (ref.current.contains(document.activeElement)) {
        return;
      }

      setMenuVisible(false);
    });
  };

  const onButtonClick = event => {
    const rect = event.target.getBoundingClientRect();
    setMenuStyle({ top: rect.top + rect.height, position: "fixed" });
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
    menuStyle,
    menuVisible,
    onButtonClick,
    onBlur,
    ref
  };
};
