import { Element, JsExpression, JsExpressionKind } from "paperclip-utils";
import {
  InterimConjunctionOperator,
  InterimScriptExpressionKind,
  InterimScriptExpression
} from "../state/script";
import { translateElement } from "./html";
import { ModuleContext } from "./options";

export const translateScript = (
  script: JsExpression,
  context: ModuleContext
): InterimScriptExpression => {
  switch (script.jsKind) {
    case JsExpressionKind.Group: {
      return {
        kind: InterimScriptExpressionKind.Group,
        inner: translateScript(script.expression, context),
        range: script.range
      };
    }
    case JsExpressionKind.Node: {
      return {
        kind: InterimScriptExpressionKind.Element,
        element: translateElement(script as Element, context),
        range: script.range
      };
    }
    case JsExpressionKind.Not: {
      return {
        kind: InterimScriptExpressionKind.Not,
        expression: translateScript(script.expression, context),
        range: script.range
      };
    }
    case JsExpressionKind.Number: {
      return {
        kind: InterimScriptExpressionKind.Number,
        value: String(script.value),
        range: script.range
      };
    }
    case JsExpressionKind.Reference: {
      return {
        kind: InterimScriptExpressionKind.Reference,
        name: script.path[0].name,
        optional: script.path[0].optional,
        range: script.range
      };
    }
    case JsExpressionKind.Boolean: {
      return {
        kind: InterimScriptExpressionKind.Boolean,
        value: script.value,
        range: script.range
      };
    }
    case JsExpressionKind.String: {
      return {
        kind: InterimScriptExpressionKind.String,
        value: script.value,
        range: script.range
      };
    }
    case JsExpressionKind.Conjunction: {
      return {
        kind: InterimScriptExpressionKind.Conjunction,
        operator: (script.operator as any) as InterimConjunctionOperator,
        left: translateScript(script.left, context),
        right: translateScript(script.right, context),
        range: script.range
      };
    }
  }
};
