import React, { memo, useEffect, useRef, useState } from "react";
import * as path from "path";
import { useDispatch } from "react-redux";
import * as styles from "./index.pc";
import { StyleRuleInfo } from "@paperclip-ui/utils";
import { uiActions } from "../../../../../actions";
import { noop } from "lodash";
import * as declAst from "@paperclip-ui/utils/lib/css/decl-value-ast";
import { DeclarationName } from "./Declaration/Name";
import { DeclarationValue } from "./Declaration/Value";

type DeclarationItem = {
  name: string;
  value: declAst.DeclValueRoot;
  rawValue: string;
  id?: string;
  sourceRules?: StyleRuleInfo[];
};

type StyleDeclarationListProps = {
  items: DeclarationItem[];
  computed?: boolean;
  showNewInput?: boolean;
};

export const StyleDeclarationList = (props: StyleDeclarationListProps) => {
  const {
    ref,
    onBlur2,
    onClick,
    internalItems,
    computed,
    items,
    onLastValueTab,
    newDeclarationCount,
    setNewDeclarationCount,
    syncFocus,
  } = useStyleDeclarationList(props);

  return (
    <div ref={ref} onBlur={onBlur2} onClick={onClick}>
      {internalItems.map((item, i) => (
        <ComputedDeclaration
          key={item.name}
          computed={computed}
          item={item}
          onTab={i === items.length - 1 && onLastValueTab}
        />
      ))}
      {Array.from({ length: newDeclarationCount }).map((decl, i) => (
        <NewDeclaration
          key={i}
          computed={computed}
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
    </div>
  );
};

const useStyleDeclarationList = ({
  items,
  computed,
  showNewInput,
}: StyleDeclarationListProps) => {
  const [internalItems, setInternalItems] = useState(items);

  const [focused, setFocused] = useState(false);
  const [newDeclarationCount, setNewDeclarationCount] = useState(0);

  useEffect(() => {
    if (!focused) {
      setInternalItems(items);
      setNewDeclarationCount(0);
    }
  }, [focused, items]);

  useEffect(() => {
    if (showNewInput && !newDeclarationCount) {
      setNewDeclarationCount(1);
    }
  }, [showNewInput]);

  const onLastValueTab = () => {
    setNewDeclarationCount(newDeclarationCount + 1);
  };

  const syncFocus = () => {
    setTimeout(() => {
      setFocused(ref.current.contains(document.activeElement));
    }, 100);
  };

  const ref = useRef<HTMLDivElement>();

  const onBlur2 = () => {
    syncFocus();
  };

  const onClick = () => {
    if (!internalItems.length && !newDeclarationCount) {
      setNewDeclarationCount(newDeclarationCount + 1);
    }
  };

  return {
    internalItems,
    onBlur2,
    onLastValueTab,
    setNewDeclarationCount,
    syncFocus,
    newDeclarationCount,
    computed,
    items,
    ref,
    onClick,
  };
};

type BaseComputedDeclaration = {
  ref?: any;
  showNameInput?: boolean;
  name?: string;
  computed?: boolean;
  value?: string;
  valueExpr: declAst.DeclValueRoot;
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
  computed,
  showSourceRules,
  sourceRules = [],
  showNameInput,
  onExpandClick,
  onNameChange,
  onValueChange,
  valueExpr,
  onNameSave,
  onValueSave,
  onValueTab,
}: BaseComputedDeclaration) => {
  return (
    <styles.StyleRuleProperty
      ref={ref}
      collapsed={!showSourceRules}
      computed={computed}
      name={
        <DeclarationName
          showInput={showNameInput}
          value={name}
          onSave={onNameSave}
          onChange={onNameChange}
        />
      }
      value={
        <DeclarationValue
          exprValue={valueExpr}
          value={value}
          onSave={onValueSave}
          onChange={onValueChange}
          onTab={onValueTab}
        />
      }
      onExpandClick={onExpandClick}
    >
      {showSourceRules &&
        sourceRules &&
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
  computed: boolean;
  onTab?: (name?: string, value?: string) => void;
  onSave?: (name?: string, value?: string) => void;
};

const NewDeclaration = ({
  computed,
  onTab = noop,
  onSave,
}: NewDeclarationProps) => {
  const dispatch = useDispatch();
  const [currInfo, setCurrentInfo] = useState<{
    name?: string;
    value?: string;
  }>({});
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const ref = useRef<HTMLElement>();

  const onSave2 = () => {
    if ((name && value) || (currInfo.name && currInfo.value)) {
      setCurrentInfo({ name, value });
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
      name={currInfo.name}
      value={currInfo.value}
      valueExpr={null}
      showNameInput
      computed={computed}
      onNameChange={setName}
      onNameSave={onSave2}
      onValueSave={onSave2}
      onValueChange={setValue}
      onValueTab={() =>
        setTimeout(() => {
          if (onTab) {
            onTab(name, value);
          }
        }, 5)
      }
    />
  );
};

type ComputedDeclarationProps = {
  item?: DeclarationItem;
  computed: boolean;
  onTab?: () => void;
};

const ComputedDeclaration = memo(
  ({ item, computed, onTab }: ComputedDeclarationProps) => {
    // need to use so much internal state since state is locked in so long
    // as there's focus on the declaration list.
    const [currItem, setCurrItem] = useState(item);
    const [name, setName] = useState(item.name);
    const [value, setValue] = useState(item.rawValue);

    useEffect(() => {
      setCurrItem(item);
      setName(item.name);
      setValue(item.rawValue);
    }, [item]);

    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const onValueSave = () => {
      dispatch(
        uiActions.computedStyleDeclarationChanged({
          id: item.id,
          name: name,
          value: value,
        })
      );
      setCurrItem({ ...currItem, rawValue: value });
    };
    const onNameSave = () => {
      dispatch(
        uiActions.computedStyleDeclarationChanged({
          id: item.id,
          oldName: currItem.name,
          name,
          value,
        })
      );
      setCurrItem({ ...currItem, name });
    };
    const onClick = () => {
      setOpen(!open);
    };
    return (
      <BaseComputedDeclaration
        computed={computed}
        name={currItem.name}
        value={currItem.rawValue}
        valueExpr={currItem.value}
        sourceRules={item.sourceRules}
        onNameChange={setName}
        onValueChange={setValue}
        onNameSave={onNameSave}
        onValueSave={onValueSave}
        onExpandClick={onClick}
        showSourceRules={open}
        onValueTab={onTab}
      />
    );
  }
);
