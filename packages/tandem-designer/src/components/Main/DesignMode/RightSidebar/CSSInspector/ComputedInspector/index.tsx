import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import * as path from "path";
import { AppState } from "../../../../../../state";
import { useDispatch, useSelector } from "react-redux";
import * as styles from "../index.pc";
import {
  squashInspection,
  ComputedDeclarationInfo,
  StyleRuleInfo,
} from "@paperclip-ui/utils";
import { DeclarationValue as DeclarationPart } from "../Declaration";
import { uiActions } from "../../../../../../actions";

export const ComputedInspector = () => {
  const inspection = useSelector(
    (state: AppState) => state.designer.selectedNodeStyleInspections[0]
  );
  const [focused, setFocused] = useState(false);
  const [newDeclarationCount, setNewDeclarationCount] = useState(0);

  const [computedProps, setComputedProps] = useState([]);

  useEffect(() => {
    if (!computedProps || !focused) {
      setComputedProps(
        squashInspection(inspection).filter((comp) => !comp.variable)
      );
      setNewDeclarationCount(0);
    }
  }, [focused, inspection]);

  const onLastValueTab = () => {
    setNewDeclarationCount(newDeclarationCount + 1);
  };

  const syncFocus = () => {
    setTimeout(() => {
      setFocused(ref.current.contains(document.activeElement));
    }, 100);
  };

  const ref = useRef<HTMLElement>();

  const onBlur = (event: React.FocusEvent<any>) => {
    syncFocus();
  };

  return (
    <>
      <styles.ComputedStyles ref={ref} onBlur={onBlur}>
        {computedProps.map((info, i) => (
          <ComputedDeclaration
            key={info.name}
            info={info}
            onTab={i === computedProps.length - 1 && onLastValueTab}
          />
        ))}
        {Array.from({ length: newDeclarationCount }).map((decl, i) => (
          <NewDeclaration
            key={i}
            onSave={(name, value) => {
              if (!name || !value) {
                setNewDeclarationCount(newDeclarationCount - 1);
              }
              syncFocus();
            }}
            onTab={
              i === newDeclarationCount - 1 &&
              ((name, value) => {
                if (name && value) {
                  onLastValueTab();
                }
              })
            }
          />
        ))}
      </styles.ComputedStyles>
    </>
  );
};

type BaseComputedDeclaration = {
  ref?: any;
  showNameInput?: boolean;
  name?: string;
  value?: string;
  onNameChange?: (value: string) => void;
  onValueChange?: (value: string) => void;
  onNameSave: (value: string) => void;
  onValueSave: (value: string) => void;
  onExpandClick?: () => void;
  onValueTab?: () => void;
  sourceRules?: StyleRuleInfo[];
  showSourceRules?: boolean;
};

const BaseComputedDeclaration = ({
  ref,
  name,
  value,
  showSourceRules,
  sourceRules = [],
  showNameInput,
  onExpandClick,
  onNameChange,
  onValueChange,
  onNameSave,
  onValueSave,
  onValueTab,
}: BaseComputedDeclaration) => {
  return (
    <styles.StyleRuleProperty
      ref={ref}
      collapsed={!showSourceRules}
      computed
      name={
        <DeclarationPart
          showInput={showNameInput}
          value={name}
          onSave={onNameSave}
          onChange={onNameChange}
        />
      }
      value={
        <DeclarationPart
          value={value}
          onSave={onValueSave}
          onChange={onValueChange}
          onTab={onValueTab}
        />
      }
      onExpandClick={onExpandClick}
    >
      {showSourceRules &&
        sourceRules.map((rule) => (
          <styles.ComputedPropertySource
            fileName={path.basename(rule.sourceUri)}
            selector={rule.selectorText}
          />
        ))}
    </styles.StyleRuleProperty>
  );
};

type NewDeclarationProps = {
  onTab?: (name?: string, value?: string) => void;
  onSave?: (name?: string, value?: string) => void;
};

const NewDeclaration = ({ onTab, onSave }: NewDeclarationProps) => {
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const ref = useRef<HTMLElement>();

  const onSave2 = () => {
    if (name && value) {
      dispatch(
        uiActions.computedStyleDeclarationChanged({
          name,
          value,
        })
      );
      onSave(name, value);
    }
  };

  return (
    <BaseComputedDeclaration
      ref={ref}
      showNameInput
      onNameChange={setName}
      onNameSave={onSave2}
      onValueSave={onSave2}
      onValueChange={setValue}
      onValueTab={() =>
        setTimeout(() => {
          onSave2();
          onTab(name, value);
        }, 5)
      }
    />
  );
};

type ComputedDeclarationProps = {
  info?: ComputedDeclarationInfo;
  onTab?: () => void;
};

const ComputedDeclaration = memo(
  ({ info, onTab }: ComputedDeclarationProps) => {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const onValueSave = (value: string) => {
      dispatch(
        uiActions.computedStyleDeclarationChanged({
          name: info.name,
          value: value,
        })
      );
    };
    const onNameSave = (value: string) => {
      dispatch(
        uiActions.computedStyleDeclarationChanged({
          oldName: info.name,
          name: value,
          value: info.value,
        })
      );
    };
    const onClick = () => {
      setOpen(!open);
    };
    return (
      <BaseComputedDeclaration
        name={info.name}
        value={info.value}
        sourceRules={info.sourceRules}
        onNameSave={onNameSave}
        onValueSave={onValueSave}
        onExpandClick={onClick}
        showSourceRules={open}
        onValueTab={onTab}
      />
    );
  }
);
