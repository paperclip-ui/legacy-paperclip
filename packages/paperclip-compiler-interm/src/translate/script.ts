import { Element, JsExpression, JsExpressionKind } from "paperclip-utils";
import {
  IntermConjunctionOperator,
  IntermScriptExpressionKind,
  IntermScriptExpression
} from "../state/script";
import { translateElement } from "./html";
import { ModuleContext } from "./options";

export const translateScript = (
  script: JsExpression,
  context: ModuleContext
): IntermScriptExpression => {
  switch (script.jsKind) {
    case JsExpressionKind.Group: {
      return {
        kind: IntermScriptExpressionKind.Group,
        inner: translateScript(script.expression, context),
        range: script.range
      };
    }
    case JsExpressionKind.Node: {
      return {
        kind: IntermScriptExpressionKind.Element,
        element: translateElement(script as Element, context),
        range: script.range
      };
    }
    case JsExpressionKind.Not: {
      return {
        kind: IntermScriptExpressionKind.Not,
        expression: translateScript(script.expression, context),
        range: script.range
      };
    }
    case JsExpressionKind.Number: {
      return {
        kind: IntermScriptExpressionKind.Number,
        value: String(script.value),
        range: script.range
      };
    }
    case JsExpressionKind.Reference: {
      return {
        kind: IntermScriptExpressionKind.Reference,
        name: script.path[0].name,
        optional: script.path[0].optional,
        range: script.range
      };
    }
    case JsExpressionKind.Boolean: {
      return {
        kind: IntermScriptExpressionKind.Boolean,
        value: script.value,
        range: script.range
      };
    }
    case JsExpressionKind.String: {
      return {
        kind: IntermScriptExpressionKind.String,
        value: script.value,
        range: script.range
      };
    }
    case JsExpressionKind.Conjunction: {
      return {
        kind: IntermScriptExpressionKind.Conjunction,
        operator: (script.operator as any) as IntermConjunctionOperator,
        left: translateScript(script.left, context),
        right: translateScript(script.right, context),
        range: script.range
      };
    }
  }
};
