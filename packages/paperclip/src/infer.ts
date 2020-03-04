import {
  Node,
  NodeKind,
  Text,
  Element,
  AttributeKind,
  AttributeValueKind,
  BlockKind,
  ConditionalBlockKind,
  EachBlock,
  Conditional,
  ConditionalBlock,
  PassFailConditional,
  FinalConditional,
  Slot,
  SlotAttributeValue,
  Attribute,
  Fragment,
  Block
} from "./ast";
import {
  Statement,
  StatementKind,
  JsArray,
  JsBoolean,
  JsNumber,
  JsNode,
  JsString,
  JsObject,
  JsObjectProperty
} from "./js-ast";
import { PREVIEW_TAG_NAME, PART_TAG_NAME } from "./constants";

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
    [identifier: string]: Inference;
  };
} & BaseInference<InferenceKind.Shape>;

export type ArrayInference = {
  value: Inference;
} & BaseInference<InferenceKind.Array>;

export type AnyInference = BaseInference<InferenceKind.Any>;

export type Inference = ShapeInference | ArrayInference | AnyInference;

export type Context = {
  scope: {
    [identifier: string]: string[];
  };
  inference: Inference;
};

const createShapeInference = (
  properties: {
    [identifier: string]: Inference;
  } = {},
  fromSpread = false
): ShapeInference => ({ kind: InferenceKind.Shape, fromSpread, properties });
const createArrayInference = (value: Inference): ArrayInference => ({
  kind: InferenceKind.Array,
  value
});
const createAnyInference = (): AnyInference => ({ kind: InferenceKind.Any });
const createInference = (kind: InferenceKind) => {
  switch (kind) {
    case InferenceKind.Any:
      return createAnyInference();
    case InferenceKind.Shape:
      return createShapeInference();
    case InferenceKind.Array:
      return createArrayInference(createAnyInference());
  }
};

const ANY_INFERENCE = createAnyInference();
const SPREADED_SHAPE_INFERENCE = createShapeInference({}, true);
const SHAPE_INFERENCE = createShapeInference({});
const ARRAY_INFERENCE = createArrayInference(createAnyInference());

const addShapeInferenceProperty = (
  name: string,
  value: Inference,
  shape: ShapeInference
): ShapeInference => ({
  ...shape,
  properties: {
    ...shape.properties,
    [name]: value
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
  path: string[],
  value: Inference,
  inference: Inference,
  _index: number = 0
): Inference => {
  if (path.length === 0) {
    return inference;
  }
  if (inference.kind === InferenceKind.Any) {
    inference = createShapeInference();
  }

  if (inference.kind === InferenceKind.Shape) {
    if (_index < path.length - 1) {
      let child = inference.properties[path[_index]] || createShapeInference();
      child = addInferenceProperty(path, value, child, _index + 1);
      inference = addShapeInferenceProperty(path[_index], child, inference);
    } else {
      const existingInference =
        inference.properties[path[_index]] || ANY_INFERENCE;

      if (existingInference.kind === InferenceKind.Shape) {
        value = mergeShapeInference(existingInference, value);
      }

      inference = addShapeInferenceProperty(path[_index], value, inference);
    }
  }

  if (inference.kind === InferenceKind.Array) {
    inference = {
      ...inference,
      value: addInferenceProperty(path, value, inference.value, _index)
    };
  }

  return inference;
};

const unfurlScopePath = (path: string[], context: Context) => {
  let cpath = path;

  if (!context.scope[path[0]]) {
    return path;
  }

  let entirePath = path;

  while (1) {
    const property = cpath[0];
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
  path: string[],
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

const setScope = (
  property: string,
  path: string[],
  context: Context
): Context => ({
  ...context,
  scope: {
    ...context.scope,
    [property]: path
  }
});

export const infer = (ast: Node): ShapeInference => {
  return inferNode(ast, true, {
    scope: {},
    inference: createShapeInference()
  }).inference as ShapeInference;
};

const inferNode = (ast: Node, isRoot: boolean, context: Context): Context => {
  switch (ast.kind) {
    case NodeKind.Element:
      return inferElement(ast, isRoot, context);
    case NodeKind.Slot:
      return inferSlot(ast, context);
    case NodeKind.Fragment:
      return inferFragment(ast, context);
    case NodeKind.Block:
      return inferBlock(ast, context);
  }
  return context;
};

const inferBlock = (block: Block, context: Context): Context => {
  switch (block.blockKind) {
    case BlockKind.Each:
      return inferEachBlock(block, context);
    case BlockKind.Conditional:
      return inferConditionBlock(block, context);
  }
  return context;
};

const inferEachBlock = (block: EachBlock, context: Context): Context => {
  context = inferStatement(block.source, context, ARRAY_INFERENCE);
  if (block.body) {
    const scopePath =
      block.source.jsKind === StatementKind.Reference ? block.source.path : [];

    context = setScope(block.valueName, scopePath, context);
    context = setScope(block.keyName, [], context);
    context = inferNode(block.body, false, context);
    context = setScope(block.valueName, null, context);
    context = setScope(block.keyName, null, context);
  }

  return context;
};

const inferConditionBlock = (block: Conditional, context: Context): Context => {
  if (block.conditionalBlockKind === ConditionalBlockKind.PassFailBlock) {
    context = inferStatement(block.condition, context);
    if (block.fail) {
      context = inferConditionBlock(block.fail, context);
    }
  }
  if (block.body) {
    context = inferNode(block.body, false, context);
  }
  return context;
};

const inferElement = (element: Element, isRoot: boolean, context: Context) => {
  if (
    element.tagName === PREVIEW_TAG_NAME ||
    (element.tagName === PART_TAG_NAME && !isRoot)
  ) {
    return context;
  }
  for (const atttribute of element.attributes) {
    context = inferAttribute(atttribute, context);
  }
  context = inferChildren(element.children, context);
  return context;
};

const inferAttribute = (attribute: Attribute, context: Context) => {
  switch (attribute.kind) {
    case AttributeKind.KeyValueAttribute: {
      if (
        attribute.value &&
        attribute.value.attrValueKind === AttributeValueKind.Slot
      ) {
        context = inferStatement(attribute.value, context);
      }
      break;
    }
    case AttributeKind.ShorthandAttribute: {
      context = inferStatement(attribute.reference, context);
      break;
    }
    case AttributeKind.SpreadAttribute: {
      context = inferStatement(
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
  return inferStatement(slot.script, context);
};

const inferFragment = (fragment: Fragment, context: Context) => {
  return inferChildren(fragment.children, context);
};

const inferChildren = (children: Node[], context: Context) =>
  children.reduce(
    (context, child) => inferNode(child, false, context),
    context
  );

const inferStatement = (
  statement: Statement,
  context: Context,
  defaultInference: Inference = ANY_INFERENCE
) => {
  switch (statement.jsKind) {
    case StatementKind.Reference: {
      context = addContextInferenceProperty(
        statement.path,
        defaultInference,
        context
      );
      break;
    }
  }
  return context;
};
