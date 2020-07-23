import {
  NodeKind,
  AttributeKind,
  AttributeValueKind,
  StatementKind,
  DynamicStringAttributeValuePartKind
} from "paperclip-utils";
// TODO - this should be built in rust
export var InferenceKind;
(function(InferenceKind) {
  InferenceKind[(InferenceKind["Shape"] = 0)] = "Shape";
  InferenceKind[(InferenceKind["Array"] = 1)] = "Array";
  InferenceKind[(InferenceKind["Any"] = 2)] = "Any";
})(InferenceKind || (InferenceKind = {}));
const createShapeInference = (properties = {}, fromSpread = false) => ({
  kind: InferenceKind.Shape,
  fromSpread,
  properties
});
const createAnyInference = () => ({ kind: InferenceKind.Any });
const ANY_INFERENCE = createAnyInference();
const SPREADED_SHAPE_INFERENCE = createShapeInference({}, true);
const addShapeInferenceProperty = (part, value, shape) => {
  var _a, _b;
  return Object.assign(Object.assign({}, shape), {
    properties: Object.assign(Object.assign({}, shape.properties), {
      [part.name]: {
        value,
        optional:
          ((_a = shape.properties[part.name]) === null || _a === void 0
            ? void 0
            : _a.optional) === false
            ? (_b = shape.properties[part.name]) === null || _b === void 0
              ? void 0
              : _b.optional
            : part.optional
      }
    })
  });
};
const mergeShapeInference = (existing, extended) => {
  if (extended.kind === InferenceKind.Any) {
    return existing;
  }
  if (extended.kind === InferenceKind.Array) {
    console.error(`Conflict: can't access properties of arra`);
    // ERRROR!
    return existing;
  }
  return Object.assign(Object.assign({}, existing), {
    properties: Object.assign(
      Object.assign({}, existing.properties),
      extended.properties
    )
  });
};
const addInferenceProperty = (path, value, owner, _index = 0) => {
  var _a, _b;
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
        ((_a = owner.properties[part.name]) === null || _a === void 0
          ? void 0
          : _a.value) || createShapeInference();
      childValue = addInferenceProperty(path, value, childValue, _index + 1);
      owner = addShapeInferenceProperty(part, childValue, owner);
    } else {
      const existingInference =
        ((_b = owner.properties[part.name]) === null || _b === void 0
          ? void 0
          : _b.value) || ANY_INFERENCE;
      if (existingInference.kind === InferenceKind.Shape) {
        value = mergeShapeInference(existingInference, value);
      }
      owner = addShapeInferenceProperty(part, value, owner);
    }
  }
  if (owner.kind === InferenceKind.Array) {
    owner = Object.assign(Object.assign({}, owner), {
      value: addInferenceProperty(path, value, owner.value, _index)
    });
  }
  return owner;
};
const unfurlScopePath = (path, context) => {
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
const addContextInferenceProperty = (path, value, context) =>
  Object.assign(Object.assign({}, context), {
    inference: addInferenceProperty(
      unfurlScopePath(path, context),
      value,
      context.inference
    )
  });
export const infer = ast => {
  return inferNode(ast, true, {
    scope: {},
    inference: createShapeInference()
  }).inference;
};
const inferNode = (ast, isRoot, context) => {
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
const inferElement = (element, isRoot, context) => {
  for (const atttribute of element.attributes) {
    context = inferAttribute(atttribute, context);
  }
  context = inferChildren(element.children, context);
  return context;
};
const inferAttribute = (attribute, context) => {
  switch (attribute.kind) {
    case AttributeKind.KeyValueAttribute: {
      if (
        attribute.value &&
        attribute.value.attrValueKind === AttributeValueKind.Slot
      ) {
        context = inferStatement(attribute.value.script, context);
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
const inferSlot = (slot, context) => {
  return inferStatement(slot.script, context);
};
const inferFragment = (fragment, context) => {
  return inferChildren(fragment.children, context);
};
const inferChildren = (children, context) =>
  children.reduce(
    (context, child) => inferNode(child, false, context),
    context
  );
const inferStatement = (
  statement,
  context,
  defaultInference = ANY_INFERENCE
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
