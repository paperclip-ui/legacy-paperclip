import { Element, JsExpression, JsExpressionKind } from "paperclip-utils";
import {
  IntermConjunctionOperator,
  IntermIntermScriptExpressionKind,
  IntermScriptExpression
} from "../state/script";
import { translateElement } from "./html";
import { IntermediateCompilerOptions } from "./options";

export const translateScript = (options: IntermediateCompilerOptions) => (
  script: JsExpression
): IntermScriptExpression => {
  switch (script.jsKind) {
    case JsExpressionKind.Group: {
      return {
        kind: IntermIntermScriptExpressionKind.Group,
        inner: translateScript(options)(script.expression),
        range: script.range
      };
    }
    case JsExpressionKind.Node: {
      return {
        kind: IntermIntermScriptExpressionKind.Element,
        element: translateElement(options)(script as Element),
        range: script.range
      };
    }
    case JsExpressionKind.Not: {
      return {
        kind: IntermIntermScriptExpressionKind.Not,
        expression: translateScript(options)(script.expression),
        range: script.range
      };
    }
    case JsExpressionKind.Number: {
      return {
        kind: IntermIntermScriptExpressionKind.Number,
        value: String(script.value),
        range: script.range
      };
    }
    case JsExpressionKind.Reference: {
      return {
        kind: IntermIntermScriptExpressionKind.Reference,
        name: script.path[0].name,
        optional: script.path[0].optional,
        range: script.range
      };
    }
    case JsExpressionKind.Boolean: {
      return {
        kind: IntermIntermScriptExpressionKind.Boolean,
        value: script.value,
        range: script.range
      };
    }
    case JsExpressionKind.String: {
      return {
        kind: IntermIntermScriptExpressionKind.String,
        value: script.value,
        range: script.range
      };
    }
    case JsExpressionKind.Conjunction: {
      return {
        kind: IntermIntermScriptExpressionKind.Conjunction,
        operator: (script.operator as any) as IntermConjunctionOperator,
        left: translateScript(options)(script.left),
        right: translateScript(options)(script.right),
        range: script.range
      };
    }
  }
};
