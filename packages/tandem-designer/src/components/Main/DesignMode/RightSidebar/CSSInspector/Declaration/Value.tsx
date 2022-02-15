import * as declAst from "@paperclip-ui/utils/lib/css/decl-value-ast";
import * as styles from "../index.pc";
import React, { useRef } from "react";
import { BlendedTextInput } from "../../../../../TextInput/blended";
import {
  useDeclarationPart,
  UseDeclarationPartProps,
} from "./useDeclarationPart";

export type DeclarationValueProps = {
  exprValue: declAst.DeclValueRoot;
} & UseDeclarationPartProps;

export const DeclarationValue = ({
  exprValue,
  ...rest
}: DeclarationValueProps) => {
  const {
    editingValue,
    onClick,
    onFocus,
    internalValue,
    onSave2,
    onTab,
    onKeyDown,
    setInternalValue,
    setEditingValue,
    onBlur,
  } = useDeclarationPart(rest);

  return (
    <span tabIndex={editingValue ? -1 : 0} onClick={onClick} onFocus={onFocus}>
      {editingValue ? (
        <BlendedTextInput
          autoResize
          autoFocus
          select
          value={internalValue}
          onKeyDown={(event: React.KeyboardEvent<any>) => {
            if (event.key === "Tab") {
              onSave2();
              if (!event.shiftKey && onTab) {
                onTab();
              }
            }
            onKeyDown(event);
          }}
          onValueChange={setInternalValue}
          onEnterPressed={() => {
            onSave2();
            setEditingValue(false);
          }}
          onBlur={() => {
            onSave2();
            onBlur();
          }}
        />
      ) : (
        internalValue
      )}
    </span>
  );
};

type RichValueProps = {
  value: declAst.DeclValueRoot;
};

const RichValue = ({ value }: RichValueProps) => {
  return (
    <styles.StyleRulePropertyValue>
      <RichRootValue value={value.value} />
    </styles.StyleRulePropertyValue>
  );
};

type RichRootValueProps = {
  value: declAst.RootValue;
};

const RichRootValue = ({ value }: RichRootValueProps) => {
  if (value.expressionKind === declAst.DeclRootValueKind.List) {
    return <RichList value={value} />;
  } else if (value.expressionKind === declAst.DeclRootValueKind.Group) {
    return <RichGroup value={value} />;
  } else if (value.expressionKind === declAst.DeclRootValueKind.Value) {
    return <RichValuePart value={value} />;
  }

  return null;
};

type RichListProps = {
  value: declAst.List;
};

const RichList = ({ value }: RichListProps) => {
  return (
    <>
      {value.items.map((item, index) => (
        <RichListItem value={item} key={index} />
      ))}
    </>
  );
};

type RichListItemProps = {
  value: declAst.ListItem;
};

const RichListItem = ({ value }: RichListItemProps) => {
  if (value.listItemKind === declAst.ListItemKind.Group) {
    return <RichGroup value={value} />;
  }

  return <RichValuePart value={value} />;
};

type RichGroupProps = {
  value: declAst.Group;
};

const RichGroup = ({ value }: RichGroupProps) => {
  return (
    <>
      {value.parameters.map((item, index) => (
        <RichValuePart value={item} key={index} />
      ))}
    </>
  );
};

type RichValuePartProps = {
  value: declAst.Value;
};

const RichValuePart = ({ value }: RichValuePartProps) => {
  switch (value.valueKind) {
    case declAst.ValueKind.Raw: {
      return <>{value.value}</>;
    }
    case declAst.ValueKind.Dimension: {
      return <styles.UnitPart value={stringifyDeclAST(value)} />;
    }
    case declAst.ValueKind.Hex: {
      return <ColorValuePart value={value} />;
    }
    case declAst.ValueKind.FunctionCall: {
      return <RichFunctionCall value={value} />;
    }
  }

  return null;
};

type ColorValuePartProps = {
  value: declAst.Value;
};

const ColorValuePart = ({ value }: ColorValuePartProps) => {
  const strValue = stringifyDeclAST(value);
  const ref = useRef<HTMLDivElement>();

  const onColorBoxMouseDown = (event: React.MouseEvent<any>) => {
    event.preventDefault();
  };
  return (
    <>
      <styles.ColorPropertyPart
        ref={ref}
        value={strValue}
        onColorBoxMouseDown={onColorBoxMouseDown}
      />
    </>
  );
};

type RichFunctionCallProps = {
  value: declAst.FunctionCall;
};

const RichFunctionCall = ({ value }: RichFunctionCallProps) => {
  if (/rgba?|hsl|hwb|lab/.test(value.name)) {
    return <ColorValuePart value={value} />;
  }

  return null;
};

const stringifyDeclAST = (value: declAst.Value | declAst.Group) => {
  if (value.listItemKind === declAst.ListItemKind.Group) {
    return value.parameters.map(stringifyDeclAST).join(" ");
  } else {
    switch (value.valueKind) {
      case declAst.ValueKind.Dimension: {
        return `${value.value.value}${value.unit}`;
      }
      case declAst.ValueKind.FunctionCall: {
        return `${value.name}(${value.parameters.items
          .map(stringifyDeclAST)
          .join(", ")})`;
      }
      case declAst.ValueKind.Hex: {
        return `#${value.value}`;
      }
      case declAst.ValueKind.String:
      case declAst.ValueKind.Number:
      case declAst.ValueKind.Raw:
      case declAst.ValueKind.Keyword: {
        return value.value;
      }
      case declAst.ValueKind.Operation: {
        return `${stringifyDeclAST(value.left)} ${
          value.operation
        } ${stringifyDeclAST(value.right)}`;
      }
    }
  }
};
