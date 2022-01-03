import {
  Element,
  ScriptExpression,
  ScriptExpressionKind
} from "paperclip-utils";
import {
  InterimConjunctionOperator,
  InterimScriptExpressionKind,
  InterimScriptExpression
} from "../state/script";
import { translateElement } from "./html";
import { ModuleContext } from "./options";

export const translateScript = (
  script: ScriptExpression,
  context: ModuleContext
): InterimScriptExpression => {
  switch (script.scriptKind) {
    case ScriptExpressionKind.Group: {
      return {
        kind: InterimScriptExpressionKind.Group,
        inner: translateScript(script.expression, context),
        range: script.range
      };
    }
    case ScriptExpressionKind.Node: {
      return {
        kind: InterimScriptExpressionKind.Element,
        element: translateElement(script as Element, context),
        range: script.range
      };
    }
    case ScriptExpressionKind.Not: {
      return {
        kind: InterimScriptExpressionKind.Not,
        expression: translateScript(script.expression, context),
        range: script.range
      };
    }
    case ScriptExpressionKind.Number: {
      return {
        kind: InterimScriptExpressionKind.Number,
        value: String(script.value),
        range: script.range
      };
    }
    case ScriptExpressionKind.Reference: {
      return {
        kind: InterimScriptExpressionKind.Reference,
        name: script.path[0].name,
        optional: script.path[0].optional,
        range: script.range
      };
    }
    case ScriptExpressionKind.Boolean: {
      return {
        kind: InterimScriptExpressionKind.Boolean,
        value: script.value,
        range: script.range
      };
    }
    case ScriptExpressionKind.String: {
      return {
        kind: InterimScriptExpressionKind.String,
        value: script.value,
        range: script.range
      };
    }
    case ScriptExpressionKind.Conjunction: {
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
