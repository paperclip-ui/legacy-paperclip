import {
  ChangedSheetsEvent,
  DiagnosticKind,
  DiffedEvent,
  EngineDelegateEvent,
  EngineDelegateEventKind,
  EngineErrorEvent,
  EngineErrorKind,
  EvaluatedEvent,
  GraphErrorEvent,
  LoadedEvent,
  RuntimeErrorEvent,
  StringRange,
} from "@paperclip-ui/utils";
import { EngineDelegate } from "@paperclip-ui/core";
import { EventEmitter } from "events";
import { createListener } from "@paperclip-ui/common";

/**
 * The diagnostic's severity.
 */
export enum DiagnosticSeverity {
  Error = 1,
  Warning = 2,
  Information = 3,
  Hint = 4,
}

/**
 * Represents a diagnostic, such as a compiler error or warning. Diagnostic objects
 * are only valid in the scope of a resource.
 */
export interface Diagnostic {
  /**
   * The range at which the message applies
   */
  range: StringRange;
  /**
   * The diagnostic's severity. Can be omitted. If omitted it is up to the
   * client to interpret diagnostics as error, warning, info or hint.
   */
  severity?: DiagnosticSeverity;
  /**
   * The diagnostic's code, which usually appear in the user interface.
   */
  code?: number | string;
  /**
   * A human-readable string describing the source of this
   * diagnostic, e.g. 'typescript' or 'super lint'. It usually
   * appears in the user interface.
   */
  source?: string;
  /**
   * The diagnostic's message. It usually appears in the user interface
   */
  message: string;
}

export type LintInfo = {
  uri: string;
  content: string;
  diagnostics: Diagnostic[];
};

export class DiagnosticService {
  private _em: EventEmitter;
  constructor(private _engine: EngineDelegate) {
    this._em = new EventEmitter();
    _engine.onEvent(this._onEngineDelegateEvent);
  }
  onLinted(listener: (info: LintInfo) => void) {
    return createListener(this._em, "linted", listener);
  }
  private _onEngineDelegateEvent = (event: EngineDelegateEvent) => {
    switch (event.kind) {
      case EngineDelegateEventKind.Error: {
        this._onEngineErrorEvent(event);
        break;
      }
      case EngineDelegateEventKind.Loaded:
      case EngineDelegateEventKind.Diffed:
      case EngineDelegateEventKind.ChangedSheets:
      case EngineDelegateEventKind.Evaluated: {
        this._onEngineEvaluatedEvent(event);
        break;
      }
    }
  };

  private _onEngineEvaluatedEvent(
    event: DiffedEvent | EvaluatedEvent | LoadedEvent | ChangedSheetsEvent
  ) {
    this._dispatchDiagnostics(event.uri);
  }

  private _onEngineErrorEvent(event: EngineErrorEvent) {
    try {
      switch (event.errorKind) {
        case EngineErrorKind.Graph: {
          return this._handleGraphError(event);
        }
        case EngineErrorKind.Runtime: {
          return this._handleRuntimeError(event);
        }
      }
    } catch (e) {
      console.error(e.stack);
    }
  }

  private _handleGraphError({ uri }: GraphErrorEvent) {
    this._dispatchDiagnostics(uri);
  }
  private _handleRuntimeError({ uri }: RuntimeErrorEvent) {
    this._dispatchDiagnostics(uri);
  }

  private _dispatchDiagnostics(uri: string) {
    // break out of recursion
    setImmediate(() => {
      const content = this._engine.getVirtualContent(uri);

      // need to provide content here too since listener may not have direct access
      // to state related to the linted diagnostics.
      this._em.emit("linted", { uri, content, diagnostics: this._lint(uri) });
    });
  }

  private _lint(uri: string): Diagnostic[] {
    return this._engine
      .lint(uri)
      .map((diag) => {
        switch (diag.diagnosticKind) {
          case DiagnosticKind.EngineError: {
            if (diag.errorKind === EngineErrorKind.Graph) {
              return createDiagnostic(
                DiagnosticSeverity.Error,
                diag.info.message,
                diag.info.range
              );
            } else if (diag.errorKind === EngineErrorKind.Runtime) {
              return createDiagnostic(
                DiagnosticSeverity.Error,
                diag.message,
                diag.range
              );
            }
            return null;
          }
          case DiagnosticKind.LintWarning: {
            return createDiagnostic(
              DiagnosticSeverity.Warning,
              diag.message,
              diag.source.textSource!.range
            );
          }
        }
      })
      .filter(Boolean);
  }
}

const createDiagnostic = (
  severity: DiagnosticSeverity,
  message: string,
  range: StringRange
) => {
  return {
    severity,
    range,
    message: `${message}`,
    source: "ex",
  };
};
