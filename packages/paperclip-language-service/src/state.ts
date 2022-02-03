import { EngineDelegate, getEngineImports } from "@paperclip-ui/core";
import { Observable } from "@paperclip-ui/common";
import {
  DependencyNodeContent,
  getAttributeStringValue,
  getParts as getComponents,
  hasAttribute,
  isPaperclipFile,
  LoadedPCData,
} from "@paperclip-ui/utils";
import { AutocompleteService } from "./autocomplete";
import { collectASTInfo, ColorInfo } from "./collect-ast-info";
import { DiagnosticService, LintInfo } from "./error-service";
import { ALL_TAG_NAMES } from "./tag-name-constants";

export enum AvailableNodeKind {
  Text = "Text",
  Element = "Element",
  Instance = "Instance",
}

export type AvailableBaseNode<TKind extends AvailableNodeKind> = {
  kind: TKind;
  displayName: string;
  name: string;
  description: string;
};

export type AvailableText = AvailableBaseNode<AvailableNodeKind.Text>;
export type AvailableElement = AvailableBaseNode<AvailableNodeKind.Element>;
export type AvailableInstance = {
  // where does the component live??
  sourceUri: string;

  // when active document is included and import already exists
  namespace?: string;
} & AvailableBaseNode<AvailableNodeKind.Instance>;

export type AvailableNode =
  | AvailableText
  | AvailableElement
  | AvailableInstance;

const AVILABLE_NATIVE_NODES: AvailableNode[] = [
  {
    kind: AvailableNodeKind.Text,
    name: "text",
    displayName: "Text",
    description: "Native text",
  },
  ...ALL_TAG_NAMES.map((tagName) => {
    return {
      kind: AvailableNodeKind.Element,
      displayName: tagName,
      name: tagName,
      description: "",
    } as AvailableElement;
  }),
];
export type GetAllAvailableNodesOptions = {
  activeUri?: string;
};

export const getAllAvailableNodes = (
  options: GetAllAvailableNodesOptions,
  engine: EngineDelegate
) => {
  const allData = engine.getAllLoadedData();
  const instances: AvailableInstance[] = [];

  for (const uri in allData) {
    const ast = engine.getLoadedAst(uri) as DependencyNodeContent;
    if (!isPaperclipFile(uri)) {
      continue;
    }
    const exportedComponents = getComponents(ast).filter(
      (component) =>
        hasAttribute("export", component) || options.activeUri === uri
    );
    instances.push(
      ...exportedComponents.map((component) => {
        const displayName = getAttributeStringValue("as", component) as string;
        return {
          kind: AvailableNodeKind.Instance,
          displayName,
          name: displayName,
          description: "",
          sourceUri: uri,
        } as AvailableInstance;
      })
    );
  }

  return [...instances, ...AVILABLE_NATIVE_NODES];
};
