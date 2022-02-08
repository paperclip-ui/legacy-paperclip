import React, { useEffect, useState } from "react";
import { StyleDeclarationInfo } from "@paperclip-ui/utils";
import * as styles from "./index.pc";
import { BlendedTextInput } from "../../../../TextInput/blended";
import { noop } from "lodash";

export type StyleRuleProps = {
  info: StyleDeclarationInfo;
  onValueChange: (value) => void;
  filter?: (value: string) => boolean;
};

export const StyleDeclaration = ({
  info,
  onValueChange,
  filter,
}: StyleRuleProps) => {
  const [editingValue, setEditingValue] = useState(false);
  const [internalValue, setInternalValue] = useState("");

  useEffect(() => {
    setInternalValue(info.value);
  }, [info.value]);

  return (
    <styles.StyleRuleProperty
      disabled={!info.active}
      name={info.name}
      boldName={filter && filter(info.name)}
      boldValue={filter && filter(info.value)}
      value={
        <styles.StyleRulePropertyValue>
          <styles.Expression>
            <DeclarationValue value={info.value} onChange={onValueChange} />
          </styles.Expression>
        </styles.StyleRulePropertyValue>
      }
    />
  );
};

export type DeclarationValueProps = {
  value: string;
  showInput?: boolean;
  onKeyDown?: (event: React.KeyboardEvent<any>) => void;
  onTab?: () => void;
  onChange: (value: string) => void;
};

export const DeclarationValue = ({
  value,
  onChange,
  showInput,
  onKeyDown = noop,
  onTab = noop,
}: DeclarationValueProps) => {
  const [editingValue, setEditingValue] = useState(showInput);
  const [internalValue, setInternalValue] = useState(value);
  const onFocus = () => {
    setEditingValue(true);
  };

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const onClick = () => setEditingValue(true);
  const onBlur = () => {
    setEditingValue(false);
  };

  return (
    <span tabIndex={0} onClick={onClick} onFocus={onFocus}>
      {editingValue ? (
        <BlendedTextInput
          autoResize
          autoFocus
          select
          value={internalValue}
          onKeyDown={(event: React.KeyboardEvent<any>) => {
            if (event.key === "Tab") {
              onChange(internalValue);
              onTab();
            }
            onKeyDown(event);
          }}
          onValueChange={setInternalValue}
          onEnterPressed={() => {
            onChange(internalValue);
            setEditingValue(false);
          }}
          onBlur={() => {
            onChange(internalValue);
            onBlur();
          }}
        />
      ) : (
        internalValue
      )}
    </span>
  );
};
