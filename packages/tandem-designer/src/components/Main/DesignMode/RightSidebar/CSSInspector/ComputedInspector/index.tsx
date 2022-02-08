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
  console.log(focused);

  const syncFocus = () => {
    setTimeout(() => {
      console.log(document.activeElement);
      setFocused(ref.current.contains(document.activeElement));
    }, 10);
  };

  // const onSave = () => {
  //   setShowNewInput(false);
  //   syncFocus();
  // }
  // const onClear = () => {
  //   setShowNewInput(false);
  //   syncFocus();
  // }

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
            onTab={i === newDeclarationCount - 1 && onLastValueTab}
          />
        ))}
      </styles.ComputedStyles>
    </>
  );
};

type BaseComputedDeclaration = {
  showNameInput?: boolean;
  name?: string;
  value?: string;
  onNameChange: (value: string) => void;
  onValueChange: (value: string) => void;
  onExpandClick?: () => void;
  onValueTab?: () => void;
  sourceRules?: StyleRuleInfo[];
  showSourceRules?: boolean;
};

const BaseComputedDeclaration = ({
  name,
  value,
  showSourceRules,
  sourceRules = [],
  showNameInput,
  onExpandClick,
  onNameChange,
  onValueChange,
  onValueTab,
}: BaseComputedDeclaration) => {
  return (
    <styles.ComputedProperty
      collapsed={!showSourceRules}
      name={
        <DeclarationPart
          showInput={showNameInput}
          value={name}
          onChange={onNameChange}
        />
      }
      value={
        <DeclarationPart
          value={value}
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
    </styles.ComputedProperty>
  );
};

type NewDeclarationProps = {
  onTab?: () => void;
};

const NewDeclaration = ({ onTab }: NewDeclarationProps) => {
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [value, setValue] = useState("");

  useEffect(() => {
    if (name && value) {
      dispatch(
        uiActions.computedStyleDeclarationChanged({
          name,
          value,
        })
      );
    }
  }, [name, value]);

  return (
    <BaseComputedDeclaration
      showNameInput
      onNameChange={setName}
      onValueChange={setValue}
      onValueTab={onTab}
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
    const onValueChange = (value: string) => {
      dispatch(
        uiActions.computedStyleDeclarationChanged({
          name: info.name,
          value: value,
        })
      );
    };
    const onNameChange = (value: string) => {
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
        onNameChange={onNameChange}
        onValueChange={onValueChange}
        onExpandClick={onClick}
        showSourceRules={open}
        onValueTab={onTab}
      />
    );
  }
);
