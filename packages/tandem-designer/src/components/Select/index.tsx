import React, { useRef, useState, memo, useMemo } from "react";
import * as styles from "./index.pc";

export type SelectOption = {
  label: string;
  value: any;
};

export type SelectProps = {
  value?: any;
  placeholder?: string;
  options: SelectOption[];
  onChange: (value: any) => void;
  disabled?: boolean;
};

export const Select = memo(
  ({ placeholder, onChange, value, options, disabled }: SelectProps) => {
    const {
      ref,
      close,
      menuVisible,
      menuStyle,
      onBlur,
      onButtonClick,
      onClick,
    } = useSelect({ value, disabled });

    const currentOption: SelectOption = options.find(
      (option) => option.value === value
    );

    const onItemClick = (value: any) => {
      onChange(value);
      close();
    };

    return (
      <styles.Container
        ref={ref}
        onBlur={onBlur}
        onClick={onClick}
        open={menuVisible}
        disabled={disabled}
      >
        <styles.default
          placeholder={currentOption?.label || placeholder || "Select Option"}
          onClick={onButtonClick}
        />
        <styles.Menu style={menuStyle}>
          {options.map((option) => (
            <styles.MenuItem
              key={option.label}
              onClick={() => onItemClick(option.value)}
            >
              {option.value}
            </styles.MenuItem>
          ))}
        </styles.Menu>
      </styles.Container>
    );
  }
);

type UseSelectOptions = {
  value?: string;
  disabled?: boolean;
};

export const useSelect = ({ value, disabled }: UseSelectOptions) => {
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

  const onButtonClick = (event) => {
    if (disabled) {
      return;
    }
    const rect = event.target.getBoundingClientRect();
    setMenuStyle({ top: rect.top + rect.height + 10, position: "fixed" });
    setMenuVisible(!menuVisible);
  };

  const close = () => {
    setMenuVisible(false);
  };

  const onClick = (event) => {
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
    ref,
  };
};
