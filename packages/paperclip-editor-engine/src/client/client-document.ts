/**
 * Editable virtual object document
 */

import { DocumentEdit } from "../core/edits";
import { EditorClient } from "./client";

/**
 */

export class ClientDocument {
  /**
   */

  constructor(private _client: EditorClient) {}

  /**
   * synchronous by default because it needs to be
   */

  applyEdits(changes: DocumentEdit[]) {}
}
