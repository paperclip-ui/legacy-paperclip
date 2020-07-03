import {
  Node,
  NodeKind,
  Element,
  AttributeKind,
  AttributeValueKind,
  Slot,
  Attribute,
  Fragment,
  Statement,
  StatementKind,
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
  fromSpread: boolean = false
): ShapeInference => ({ kind: InferenceKind.Shape, fromSpread, properties });

const createShapeProperty = (
  value: Inference,
  optional?: boolean
): ShapeProperty => ({ value, optional });

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
  _index: number = 0
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

  while (1) {
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

const setScope = (
  property: string,
  path: ReferencePart[],
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
  switch (attribute.kind) {
    case AttributeKind.KeyValueAttribute: {
      if (
        attribute.value &&
        attribute.value.attrValueKind === AttributeValueKind.Slot
      ) {
        context = inferStatement(attribute.value, context);
      }
      if (
        attribute.value &&
        attribute.value.attrValueKind === AttributeValueKind.DyanmicString
      ) {
        for (const part of attribute.value.values) {
          if (part.partKind === DynamicStringAttributeValuePartKind.Slot) {
            context = inferStatement(part, context);
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
    case StatementKind.Node: {
      context = inferNode(statement, false, context);
      break;
    }
    case StatementKind.Object: {
      for (const property of statement.properties) {
        context = inferStatement(property.value, context, defaultInference);
      }
      break;
    }
    case StatementKind.Array: {
      for (const value of statement.values) {
        context = inferStatement(value, context, defaultInference);
      }
      break;
    }
  }
  return context;
};
