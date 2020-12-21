import { Mutation, ActionKind } from "./virt-mtuation";
import {
  VirtualNode,
  VirtualElement,
  VirtualText,
  VirtualNodeKind,
  LoadedData,
  SheetInfo
} from "./virt";
import {
  DiffedEvent,
  EngineDelegateEvent,
  EngineDelegateEventKind,
  EvaluatedEvent
} from "./events";

export const patchVirtNode = (root: VirtualNode, mutations: Mutation[]) => {
  for (const mutation of mutations) {
    let target = getVirtTarget(root, mutation.nodePath);
    const action = mutation.action;
    switch (action.kind) {
      case ActionKind.DeleteChild: {
        const element = target as VirtualElement;
        const children = element.children.concat();
        children.splice(action.index, 1);
        target = { ...target, children } as VirtualElement;
        break;
      }
      case ActionKind.InsertChild: {
        const element = target as VirtualElement;
        const children = element.children.concat();
        children.splice(action.index, 0, action.child);
        target = { ...target, children } as VirtualElement;
        break;
      }
      case ActionKind.ReplaceNode: {
        target = action.replacement;
        break;
      }
      case ActionKind.RemoveAttribute: {
        const element = target as VirtualElement;
        const attributes = { ...element.attributes };
        attributes[action.name] = undefined;
        target = {
          ...target,
          attributes
        } as VirtualElement;
        break;
      }
      case ActionKind.SetAttribute: {
        const element = target as VirtualElement;
        const attributes = { ...element.attributes };
        attributes[action.name] = action.value;
        target = {
          ...target,
          attributes
        } as VirtualElement;
        break;
      }
      case ActionKind.SetAnnotations: {
        target = { ...target, annotations: action.value } as
          | VirtualElement
          | VirtualText;
        break;
      }
      case ActionKind.SetText: {
        target = { ...target, value: action.value } as VirtualText;
        break;
      }
      case ActionKind.SourceChanged: {
        const element = target as VirtualElement;
        // target = {...element, a: element.attributes}
      }
    }

    root = updateNode(root, mutation.nodePath, target) as VirtualElement;
  }
  return root;
};

export const getVirtTarget = (
  mount: VirtualNode,
  nodePath: number[]
): VirtualNode =>
  nodePath.reduce((current: VirtualElement, i) => current.children[i], mount);

const updateNode = (
  ancestor: VirtualNode,
  nodePath: number[],
  newNode: VirtualNode,
  depth = 0
) => {
  if (depth === nodePath.length) {
    return newNode;
  }
  if (
    ancestor.kind === VirtualNodeKind.Text ||
    ancestor.kind === VirtualNodeKind.StyleElement
  ) {
    return newNode;
  }
  return {
    ...ancestor,
    children: [
      ...ancestor.children.slice(0, nodePath[depth]),
      updateNode(
        ancestor.children[nodePath[depth]] as VirtualElement,
        nodePath,
        newNode,
        depth + 1
      ),
      ...ancestor.children.slice(nodePath[depth] + 1)
    ]
  };
};

export const updateAllLoadedData = (
  allData: Record<string, LoadedData>,
  event: EngineDelegateEvent
) => {
  if (event.kind === EngineDelegateEventKind.Evaluated) {
    return {
      ...allData,
      [event.uri]: {
        ...event.data,
        importedSheets: getImportedSheets(allData, event)
      }
    };
  } else if (event.kind === EngineDelegateEventKind.Diffed) {
    const existingData = allData[event.uri];

    return {
      ...allData,
      [event.uri]: {
        ...existingData,
        imports: event.data.imports,
        exports: event.data.exports,
        importedSheets: getImportedSheets(allData, event),
        allDependencies: event.data.allDependencies,
        sheet: event.data.sheet || existingData.sheet,
        preview: patchVirtNode(existingData.preview, event.data.mutations)
      }
    };
  }

  return allData;
};

const getImportedSheets = (
  allData: Record<string, LoadedData>,
  { data: { allDependencies } }: EvaluatedEvent | DiffedEvent
) => {
  // ick, wworks for now.

  const deps: SheetInfo[] = [];

  for (const depUri of allDependencies) {
    const data = allData[depUri];
    if (data) {
      deps.push({ uri: depUri, sheet: data.sheet });

      // scenario won't happen for renderer since renderers are only
      // concerned about the file that's currently opened -- ignore for now. Might
    } else {
      // console.error(`data not loaded, this shouldn't happen 😬.`);
    }
  }

  return deps;
};
