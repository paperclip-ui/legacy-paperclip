import { Mutation, ActionKind } from "./virt-mtuation";
import {
  VirtualNode,
  VirtualElement,
  VirtualText,
  VirtualNodeKind,
  LoadedData,
  SheetInfo,
  VirtualFragment,
  EvaluatedDataKind,
  EvaluatedCSSData,
  DiffedDataKind,
  LoadedPCData,
  LoadedCSSData,
  EvaluatedPCData,
} from "./virt";
import {
  DiffedEvent,
  EngineDelegateEvent,
  EngineDelegateEventKind,
  EvaluatedEvent,
} from "../core/events";
import { patchCSSSheet } from "../css/patcher";

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
        delete attributes[action.name];
        target = {
          ...target,
          attributes,
        } as VirtualElement;
        break;
      }
      case ActionKind.SetAttribute: {
        const element = target as VirtualElement;
        const attributes = { ...element.attributes };
        if (!action.value) {
          attributes[action.name] = action.value;
        } else {
          attributes[action.name] = action.value;
        }
        target = {
          ...target,
          attributes,
        } as VirtualElement;
        break;
      }
      case ActionKind.SetElementSourceInfo: {
        target = {
          ...target,
          sourceInfo: action.value,
        } as VirtualElement;
        break;
      }
      case ActionKind.SetElementSourceId: {
        target = {
          ...target,
          sourceInfo: action.value,
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
    }

    root = updateNode(root, mutation.nodePath, target) as VirtualElement;
  }
  return root;
};

export const getVirtTarget = (
  mount: VirtualNode,
  nodePath: number[]
): VirtualNode =>
  nodePath.reduce((current: VirtualElement | VirtualFragment, i) => {
    const c = current.children[i];
    return c;
  }, mount);

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
    ancestor.kind === VirtualNodeKind.StyleElement ||
    ancestor.kind === VirtualNodeKind.Slot
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
      ...ancestor.children.slice(nodePath[depth] + 1),
    ],
  };
};

export const updateAllLoadedData = (
  allData: Record<string, LoadedData>,
  event: EngineDelegateEvent
): Record<string, LoadedData> => {
  allData = updatePrimary(allData, event);

  // update dependents
  for (const name in allData) {
    const info = allData[name];
    if (info.kind === EvaluatedDataKind.PC) {
      if (info.allImportedSheetUris.includes(event.uri)) {
        allData = {
          ...allData,
          [name]: {
            ...(allData[name] as EvaluatedPCData),
            importedSheets: getImportedSheets(
              allData,
              info.allImportedSheetUris
            ),
          },
        };
      }
    }
  }

  return allData;
};

const updatePrimary = (
  allData: Record<string, LoadedData>,
  event: EngineDelegateEvent
): Record<string, LoadedData> => {
  if (event.kind === EngineDelegateEventKind.Evaluated) {
    if (event.data.kind === EvaluatedDataKind.PC) {
      return {
        ...allData,
        [event.uri]: {
          ...event.data,
          importedSheets: getImportedSheets(
            allData,
            event.data.allImportedSheetUris
          ),
        },
      };
    } else {
      return {
        ...allData,
        [event.uri]: {
          ...event.data,
        },
      };
    }
  } else if (event.kind === EngineDelegateEventKind.Diffed) {
    const existingData = allData[event.uri];

    // this will happen if client renderer loads data, but imported
    // resource has changed
    if (!existingData) {
      return allData;
    }

    if (event.data.kind === DiffedDataKind.PC) {
      const existingPCData = existingData as LoadedPCData;
      return {
        ...allData,
        [event.uri]: {
          ...existingPCData,
          exports: event.data.exports,
          importedSheets: getImportedSheets(
            allData,
            event.data.allImportedSheetUris
          ),
          allImportedSheetUris: event.data.allImportedSheetUris,
          dependencies: event.data.dependencies,
          sheet: patchCSSSheet(existingPCData.sheet, event.data.sheetMutations),
          preview: patchVirtNode(existingPCData.preview, event.data.mutations),
        },
      };
    } else {
      const existingCSSData = existingData as LoadedCSSData;
      return {
        ...allData,
        [event.uri]: {
          ...existingCSSData,
          exports: event.data.exports,
          sheet: patchCSSSheet(existingCSSData.sheet, event.data.mutations),
        },
      };
    }
  }

  return allData;
};
const getImportedSheets = (
  allData: Record<string, LoadedData>,
  allImportedSheetUris: string[]
) => {
  // ick, wworks for now.

  const deps: SheetInfo[] = [];
  for (let i = 0, { length } = allImportedSheetUris; i < length; i++) {
    const depUri = allImportedSheetUris[i];
    const data = allData[depUri];
    if (data) {
      deps.push({ uri: depUri, index: i, sheet: data.sheet });

      // scenario won't happen for renderer since renderers are only
      // concerned about the file that's currently opened -- ignore for now. Might
    } else {
      // console.error(`data not loaded, this shouldn't happen 😬.`);
    }
  }

  return deps;
};
