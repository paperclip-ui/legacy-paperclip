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
  protected _asts: {
    [identifier: string]: TAst;
  };
  protected _astInfo: {
    [identifier: string]: ASTInfo;
  };

  constructor(protected _engine: Engine) {
    this._asts = {};
    this._astInfo = {};
    _engine.onEvent(this._onEngineEvent);
  }
  abstract supports(uri: string): boolean;
  private _onEngineEvent = (event: EngineEvent) => {
    this._handleEngineEvent(event);
  };
  protected abstract _handleEngineEvent(event: EngineEvent): void;
  protected _addAST(ast: TAst, uri: string) {
    this._asts[uri] = ast;
    this._astInfo[uri] = undefined;
  }

  protected _getAST(uri: string) {
    return this._asts[uri];
  }

  getColors(uri: string) {
    return this._getASTInfo(uri).colors;
  }

  getLinks(uri: string) {
    return this._getASTInfo(uri).links;
  }
  getDefinitions(uri: string) {
    return this._getASTInfo(uri).definitions;
  }

  private _getASTInfo(uri: string): ASTInfo {
    if (!this._asts[uri]) {
      return {
        colors: [],
        links: [],
        definitions: []
      };
    }
    return (
      this._astInfo[uri] ||
      (this._astInfo[uri] = this._createASTInfo(this._asts[uri], uri))
    );
  }

  protected abstract _createASTInfo(ast: TAst, uri: string): ASTInfo;
}
