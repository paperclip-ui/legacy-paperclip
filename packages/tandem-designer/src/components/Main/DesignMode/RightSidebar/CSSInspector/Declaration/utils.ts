import * as declAst from "@paperclip-ui/utils/lib/css/decl-value-ast";

export const stringifyDeclAST = (value: declAst.Value | declAst.Group) => {
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
