/*

Considerations:

- auto-suggest based on import + relative files
- linting - emitting things to VS Code
- changes coming from language server
- Running language server in browser

*/

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
import {
  AvailableElement,
  AvailableInstance,
  AvailableNode,
  AvailableNodeKind,
} from "./state";

export class PaperclipLanguageService {
  private _autocomplete: AutocompleteService;
  private _diagnostics: DiagnosticService;
  readonly events: Observable;

  constructor(private _engine: EngineDelegate, fs?: any) {
    this._autocomplete = new AutocompleteService(fs);
    this._diagnostics = new DiagnosticService(_engine);
  }

  /**
   */

  onLinted(listener: (info: LintInfo) => void) {
    return this._diagnostics.onLinted(listener);
  }

  /**
   * Returns all definitions (meta + click functionality)
   */

  getDefinitions(uri: string) {
    return this._collectASTInfo(uri).definitions;
  }

  /**
   * Used when imports are added
   */

  getUniqueDocumentNamespace(uri: string) {}

  /**
   * returns all document links in the file
   */

  getLinks(uri: string) {
    return this._collectASTInfo(uri).links;
  }

  /**
   */

  getDocumentColors(uri: string): ColorInfo[] {
    return this._collectASTInfo(uri).colors;
  }

  /**
   * returns all available nodes in the project (text, native elements, custom components)
   */

  getAllAvailableNodes(options: GetAllAvailableNodesOptions) {
    return getAllAvailableNodes(options, this._engine);
  }

  /**
   * Returns list of options fro autocomplete
   */

  getAutoCompletionSuggestions(uri: string, position: number = Infinity) {
    return this._autocomplete.getSuggestions(
      uri,
      this._engine.getVirtualContent(uri).substr(0, position),
      this._engine.getLoadedData(uri),
      getEngineImports(uri, this._engine)
    );
  }

  private _collectASTInfo(uri: string) {
    if (!this._engine.getLoadedData(uri)) {
      this._engine.open(uri);
    }
    return collectASTInfo(
      uri,
      this._engine.getLoadedGraph(),
      this._engine.getAllLoadedData()
    );
  }
}

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

type GetAllAvailableNodesOptions = {
  activeDocumentUri?: string;
};

const getAllAvailableNodes = (
  { activeDocumentUri }: GetAllAvailableNodesOptions,
  engine: EngineDelegate
) => {
  const allData = engine.getAllLoadedData();
  const instances: AvailableInstance[] = [];

  for (const uri in allData) {
    const ast = engine.getLoadedAst(uri) as DependencyNodeContent;
    if (!isPaperclipFile(uri)) {
      continue;
    }
    const exportedComponents = getComponents(ast).filter((component) =>
      hasAttribute("export", component)
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
