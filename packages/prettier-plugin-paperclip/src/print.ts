import {
  AttributeKind,
  AttributeValueKind,
  Expression,
  isAttribute,
  isAttributeValue,
  isDynamicStringAttributeValuePart,
  DynamicStringAttributeValuePartKind,
  isNode,
  isStyleDeclaration,
  Node,
  NodeKind
} from "paperclip";
import { Doc, FastPath, Printer, doc } from "prettier";
import { isBlockTagName } from "./utils";

const {
  concat,
  join,
  line,
  group,
  indent,
  dedent,
  softline,
  hardline,
  fill,
  breakParent,
  literalline
} = doc.builders;

const MAX_LINES = 1;

const groupConcat = (docs: Doc[]) => group(concat(docs));

export const print = (path: FastPath, options: Object, print): Doc => {
  const expr: Expression = path.getValue();

  if (isNode(expr)) {
    switch (expr.kind) {
      case NodeKind.Fragment: {
        return join(hardline, path.map(print, "children"));
      }
      case NodeKind.Element: {
        let buffer: Doc[] = [];

        let openTag: Doc[] = ["<", expr.tagName];

        if (expr.attributes.length) {
          openTag.push(
            " ",
            indent(group(join(line, path.map(print, "attributes"))))
          );
        }

        const isEmpty = expr.children.length === 0;

        if (!isEmpty) {
          openTag.push(">");
          buffer.push(
            ...openTag,
            indent(
              concat([softline, group(join(line, path.map(print, "children")))])
            )
          );

          buffer.push(softline, `</${expr.tagName}>`);
        } else {
          buffer.push(...openTag, " />");
        }

        let doc: Doc = groupConcat(buffer);

        // TODO: break all elements option
        if (isBlockTagName(expr.tagName)) {
          doc = concat([doc, breakParent]);
        }

        return doc;
      }
      case NodeKind.StyleElement: {
        const buffer: Doc[] = [line, "<style>"];
        buffer.push(line, "</style>");
        return concat(buffer);
      }
      case NodeKind.Text: {
        return groupConcat([cleanWhitespace(expr.value)]);
      }
    }
  } else if (isAttribute(expr)) {
    switch (expr.kind) {
      case AttributeKind.KeyValueAttribute: {
        const buffer: Doc[] = [expr.name];
        if (expr.value) {
          buffer.push("=", path.call(print, "value"));
        }

        return groupConcat(buffer);
      }
      case AttributeKind.PropertyBoundAttribute: {
        const buffer: Doc[] = [expr.name, ":", expr.bindingName];
        buffer.push("=", path.call(print, "value"));
        console.log(expr.value);
        return groupConcat(buffer);
      }
    }
  } else if (isAttributeValue(expr)) {
    switch (expr.attrValueKind) {
      case AttributeValueKind.Slot: {
        return groupConcat(["{", "}"]);
      }
      case AttributeValueKind.String: {
        return groupConcat(['"', expr.value, '"']);
      }
      case AttributeValueKind.DyanmicString: {
        const buffer = [];
        buffer.push('"');
        buffer.push(join(" ", path.map(print, "values")));
        buffer.push('"');
        return groupConcat(buffer);
      }
    }
  } else if (isDynamicStringAttributeValuePart(expr)) {
    switch (expr.partKind) {
      case DynamicStringAttributeValuePartKind.Literal: {
        return groupConcat([expr.value]);
      }
      case DynamicStringAttributeValuePartKind.ClassNamePierce: {
        return groupConcat(["$", expr.className]);
      }
      case DynamicStringAttributeValuePartKind.Slot: {
        return concat(["ok"]);
      }
    }
  }

  return "";
};

const cleanNewLines = (buffer: string, before: boolean) => {
  const re = before ? /^[\s\r\n]+/ : /[\s\r\n]+$/;
  if (before) {
  }
  const match = buffer.match(re);

  return match
    ? Array.from({ length: Math.min(MAX_LINES, countNewLines(match[0])) }).map(
        v => hardline
      )
    : [];
};

const countNewLines = (ws: string) => {
  return (ws.match(/[\n\r]/g) || []).length;
};

const cleanWhitespace = (buffer: string) => {
  return buffer.trim().replace(/[\n\r\t\s]+/g, " ");
};
