import {
  Node,
  NodeKind,
  Element,
  AttributeKind,
  AttributeValueKind,
  Slot,
  Attribute,
  Fragment,
  ScriptExpression,
  ScriptExpressionKind,
  DynamicStringAttributeValuePartKind,
  ReferencePart
} from "paperclip-utils";

// TODO - this should be built in rust

export enum InferenceKind {
  Shape,
  Array,
  Any
}

/*
{#each items as item, i} 
  {#each item.friends as friend, j} 
    {friend.name}
  {/}
{/}

scope: {
  item: ['items'],
  i: [],
  friend: ['item', 'scope'],
  j: []
}
*/

type BaseInference<TInferenceKind extends InferenceKind> = {
  kind: TInferenceKind;
};

export type ShapeInference = {
  fromSpread: boolean;
  properties: {
    [identifier: string]: ShapeProperty;
  };
} & BaseInference<InferenceKind.Shape>;

export type ShapeProperty = {
  optional?: boolean;
  value: Inference;
};

export type ArrayInference = {
  value: Inference;
} & BaseInference<InferenceKind.Array>;

export type AnyInference = BaseInference<InferenceKind.Any>;

export type Inference = ShapeInference | ArrayInference | AnyInference;

export type Context = {
  scope: {
    [identifier: string]: ReferencePart[];
  };
  inference: Inference;
};

const createShapeInference = (
  properties: {
    [identifier: string]: ShapeProperty;
  } = {},
  fromSpread = false
): ShapeInference => ({ kind: InferenceKind.Shape, fromSpread, properties });

const createAnyInference = (): AnyInference => ({ kind: InferenceKind.Any });

const ANY_INFERENCE = createAnyInference();
const SPREADED_SHAPE_INFERENCE = createShapeInference({}, true);

const addShapeInferenceProperty = (
  part: ReferencePart,
  value: Inference,
  shape: ShapeInference
): ShapeInference => ({
  ...shape,
  properties: {
    ...shape.properties,
    [part.name]: {
      value,
      optional:
        shape.properties[part.name]?.optional === false
          ? shape.properties[part.name]?.optional
          : part.optional
    }
  }
});

const mergeShapeInference = (existing: ShapeInference, extended: Inference) => {
  if (extended.kind === InferenceKind.Any) {
    return existing;
  }

  if (extended.kind === InferenceKind.Array) {
    console.error(`Conflict: can't access properties of arra`);
    // ERRROR!
    return existing;
  }

  return {
    ...existing,
    properties: {
      ...existing.properties,
      ...extended.properties
    }
  };
};

const addInferenceProperty = (
  path: ReferencePart[],
  value: Inference,
  owner: Inference,
  _index = 0
): Inference => {
  if (path.length === 0) {
    return owner;
  }
  if (owner.kind === InferenceKind.Any) {
    owner = createShapeInference();
  }
  const part = path[_index];

  if (owner.kind === InferenceKind.Shape) {
    if (_index < path.length - 1) {
      let childValue =
        owner.properties[part.name]?.value || createShapeInference();

      childValue = addInferenceProperty(path, value, childValue, _index + 1);
      owner = addShapeInferenceProperty(part, childValue, owner);
    } else {
      const existingInference =
        owner.properties[part.name]?.value || ANY_INFERENCE;

      if (existingInference.kind === InferenceKind.Shape) {
        value = mergeShapeInference(existingInference, value);
      }

      owner = addShapeInferenceProperty(part, value, owner);
    }
  }

  if (owner.kind === InferenceKind.Array) {
    owner = {
      ...owner,
      value: addInferenceProperty(path, value, owner.value, _index)
    };
  }

  return owner;
};

const unfurlScopePath = (
  path: ReferencePart[],
  context: Context
): ReferencePart[] => {
  let cpath = path;

  if (!context.scope[path[0].name]) {
    return path;
  }

  let entirePath = path;

  while (true) {
    const property = cpath[0].name;
    const newCPath = context.scope[property];

    // if exists, but empty, then the scope is created within the template
    if (newCPath) {
      if (newCPath.length === 0) {
        return [];
      }
    } else {
      break;
    }

    entirePath = [...newCPath, ...entirePath.slice(1)];

    cpath = newCPath;
  }

  return entirePath;
};

const addContextInferenceProperty = (
  path: ReferencePart[],
  value: Inference,
  context: Context
) => ({
  ...context,
  inference: addInferenceProperty(
    unfurlScopePath(path, context),
    value,
    context.inference
  )
});

export const infer = (ast: Node): ShapeInference => {
  return inferNode(ast, true, {
    scope: {},
    inference: createShapeInference()
  }).inference as ShapeInference;
};

const inferNode = (ast: Node, isRoot: boolean, context: Context): Context => {
  switch (ast.nodeKind) {
    case NodeKind.Element:
      return inferElement(ast, isRoot, context);
    case NodeKind.Slot:
      return inferSlot(ast, context);
    case NodeKind.Fragment:
      return inferFragment(ast, context);
  }
  return context;
};

const inferElement = (element: Element, isRoot: boolean, context: Context) => {
  for (const atttribute of element.attributes) {
    context = inferAttribute(atttribute, context);
  }
  context = inferChildren(element.children, context);
  return context;
};

const inferAttribute = (attribute: Attribute, context: Context) => {
  switch (attribute.attrKind) {
    case AttributeKind.KeyValueAttribute: {
      if (
        attribute.value &&
        attribute.value.attrValueKind === AttributeValueKind.Slot
      ) {
        context = inferScriptExpression(attribute.value.script, context);
      }
      if (
        attribute.value &&
        attribute.value.attrValueKind === AttributeValueKind.DyanmicString
      ) {
        for (const part of attribute.value.values) {
          if (part.partKind === DynamicStringAttributeValuePartKind.Slot) {
            context = inferScriptExpression(part, context);
          }
        }
      }
      break;
    }
    case AttributeKind.PropertyBoundAttribute: {
      context = addContextInferenceProperty(
        [{ name: attribute.bindingName, optional: true }],
        ANY_INFERENCE,
        context
      );
      break;
    }
    case AttributeKind.ShorthandAttribute: {
      context = inferScriptExpression(attribute.reference, context);
      break;
    }
    case AttributeKind.SpreadAttribute: {
      context = inferScriptExpression(
        attribute.script,
        context,
        SPREADED_SHAPE_INFERENCE
      );
      break;
    }
  }
  return context;
};

const inferSlot = (slot: Slot, context: Context) => {
  return inferScriptExpression(slot.script, context);
};

const inferFragment = (fragment: Fragment, context: Context) => {
  return inferChildren(fragment.children, context);
};

const inferChildren = (children: Node[], context: Context) =>
  children.reduce(
    (context, child) => inferNode(child, false, context),
    context
  );

const inferScriptExpression = (
  expression: ScriptExpression,
  context: Context,
  defaultInference: Inference = ANY_INFERENCE
) => {
  switch (expression.scriptKind) {
    case ScriptExpressionKind.Reference: {
      context = addContextInferenceProperty(
        expression.path,
        defaultInference,
        context
      );
      break;
    }
    case ScriptExpressionKind.Node: {
      context = inferNode(expression, false, context);
      break;
    }
    case ScriptExpressionKind.Object: {
      for (const property of expression.properties) {
        context = inferScriptExpression(
          property.value,
          context,
          defaultInference
        );
      }
      break;
    }
    case ScriptExpressionKind.Array: {
      for (const value of expression.values) {
        context = inferScriptExpression(value, context, defaultInference);
      }
      break;
    }
    case ScriptExpressionKind.Conjunction: {
      context = inferScriptExpression(
        expression.left,
        context,
        defaultInference
      );
      context = inferScriptExpression(
        expression.right,
        context,
        defaultInference
      );
      break;
    }
    case ScriptExpressionKind.Not: {
      context = inferScriptExpression(
        expression.expression,
        context,
        defaultInference
      );
      break;
    }
  }
  return context;
};
