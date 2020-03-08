import { Engine, EngineEvent, SourceLocation } from "paperclip";

export type ColorInfo = {
  color: string;
  location: SourceLocation;
};

export type DocumentLinkInfo = {
  uri: string;
  location: SourceLocation;
};

export type DefinitionInfo = {
  sourceUri: string;
  instanceLocation: SourceLocation;
  sourceLocation: SourceLocation;
  sourceDefinitionLocation: SourceLocation;
};

export interface BaseLanguageService {
  supports(uri: string): boolean;
  getColors(uri: string): ColorInfo[];
  getDefinitions(uri: string): DefinitionInfo[];
  getLinks(uri: string): DocumentLinkInfo[];
}

export type ASTInfo = {
  colors: ColorInfo[];
  links: DocumentLinkInfo[];
  definitions: DefinitionInfo[];
};

export abstract class BaseEngineLanguageService<TAst>
  implements BaseLanguageService {
  protected _astInfo: {
    [identifier: string]: ASTInfo;
  };

  constructor(protected _engine: Engine) {
    this._astInfo = {};
    _engine.onEvent(this._onEngineEvent);
  }
  abstract supports(uri: string): boolean;
  private _onEngineEvent = (event: EngineEvent) => {
    this._handleEngineEvent(event);
  };
  protected abstract _handleEngineEvent(event: EngineEvent): void;

  protected abstract _getAST(uri: string): TAst;

  getColors(uri: string) {
    return this._getASTInfo(uri).colors;
  }

  getLinks(uri: string) {
    return this._getASTInfo(uri).links;
  }
  getDefinitions(uri: string) {
    return this._getASTInfo(uri).definitions;
  }

  protected clear(uri: string) {
    this._astInfo[uri] = undefined;
  }

  private _getASTInfo(uri: string): ASTInfo {
    const ast = this._getAST(uri);

    if (!ast) {
      return {
        colors: [],
        links: [],
        definitions: []
      };
    }
    return (
      this._astInfo[uri] ||
      (this._astInfo[uri] = this._createASTInfo(ast, uri))
    );
  }

  protected abstract _createASTInfo(ast: TAst, uri: string): ASTInfo;
}
