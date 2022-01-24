/**
 * Editable virtual object document
 */

import {
  EngineDelegateEvent,
  EngineDelegateEventKind,
  getNodeByPath,
  DiffedPCData,
  LoadedPCData,
  patchCSSSheet,
  Mutation,
  DiffedDataKind,
  patchVirtNode,
} from "@paperclip-ui/utils";
import {
  openDocumentSourceChannel,
  engineEventChannel,
  VirtualObjectEdit,
} from "../../../core";
import * as Automerge from "automerge";
import { CRDTTextDocument } from "../../../core/crdt-document";
import { DocumentKind } from "../../../core/documents";
import { BaseDocument } from "../base";
import { createListener } from "../../../core/utils";
import { editVirtualObjectsChannel } from "../../../core/channels";
import { RPCClientAdapter } from "@paperclip-ui/common";
import { produce } from "immer";
import { EventEmitter } from "events";
import { BinaryChange } from "automerge";

export type PCDocumentContent = LoadedPCData;

/**
 * TODO: include preview with this document
 */

export class PCDocument extends BaseDocument<PCDocumentContent> {
  readonly kind = DocumentKind.Paperclip;
  /**
   */

  private _openDocumentSource: ReturnType<typeof openDocumentSourceChannel>;
  private _editVirtualObject: ReturnType<typeof editVirtualObjectsChannel>;
  private _engineEvents: ReturnType<typeof engineEventChannel>;
  private _source?: CRDTTextDocument;

  /**
   */

  constructor(
    uri: string,
    private _bus: EventEmitter,
    connection: RPCClientAdapter
  ) {
    super(uri, connection);
    this._openDocumentSource = openDocumentSourceChannel(connection);
    this._engineEvents = engineEventChannel(connection);
    this._editVirtualObject = editVirtualObjectsChannel(connection);
    this._engineEvents.listen(this._onEngineEvent);
    this._bus.on("documentSourceChanged", this._onSourceDocumentChanged);
  }

  /**
   */

  public onAppliedChanges = (
    listener: (content: PCDocumentContent, event: EngineDelegateEvent) => void
  ) => {
    return createListener(this._em as any, "appliedChanges", listener);
  };

  /**
   */

  public onSourceEdited = (listener: (content: BinaryChange[]) => void) => {
    return createListener(this._em as any, "sourceEdited", listener);
  };

  /**
   */

  getNodeFromPath(path: string) {
    return getNodeByPath(path, this._content.preview);
  }

  /**
   */

  async getSource() {
    if (this._source) {
      return this._source;
    }

    this._source = CRDTTextDocument.load(
      await this._openDocumentSource.call(this.uri)
    );

    this._source.onEdit((changes) => {
      this._em.emit(`sourceEdited`, changes);
    });

    return this._source;
  }

  /**
   * synchronous by default because it needs to be
   */

  editVirtualObjects(edits: VirtualObjectEdit[]) {
    this._editVirtualObject.call({ [this.uri]: edits });
  }

  /**
   */

  private _onEngineEvent = async (event: EngineDelegateEvent) => {
    if (!this._content) {
      return;
    }

    const newData = patchPCData(this.uri, this._content, event);
    if (newData !== this._content) {
      this._updateContent(newData);
      this._em.emit("appliedChanges", this._content, event);
    }
  };

  /**
   */

  private _onSourceDocumentChanged = ({ uri, changes }) => {
    if (uri !== this.uri || !this._source) {
      return;
    }
    this._source.applyChanges(changes);
  };
}

const patchPCData = (
  uri: string,
  data: LoadedPCData,
  event: EngineDelegateEvent
) => {
  let newData = data;
  if (event.uri !== uri) {
    if (newData.allImportedSheetUris.includes(event.uri)) {
      if (event.kind === EngineDelegateEventKind.Diffed) {
        newData = produce(newData, (newData) => {
          const sheetMutations =
            event.data.kind === DiffedDataKind.PC
              ? event.data.sheetMutations
              : event.data.mutations;

          const i = newData.allImportedSheetUris.indexOf(event.uri);
          try {
            newData.importedSheets[i].sheet = patchCSSSheet(
              newData.importedSheets[i].sheet,
              sheetMutations
            );
          } catch (e) {
            console.error(e);
          }
        });
      }
    }
  } else {
    if (event.kind === EngineDelegateEventKind.Loaded) {
      newData = event.data as LoadedPCData;
    } else if (event.kind === EngineDelegateEventKind.ChangedSheets) {
      const { removedSheetUris, newSheets } = event.data;

      newData = produce(newData, (newData) => {
        for (let i = newData.importedSheets.length; i--; ) {
          const sheet = newData.importedSheets[i];
          if (removedSheetUris.includes(sheet.uri)) {
            newData.importedSheets.splice(i, 1);
          }
        }

        for (const info of newSheets) {
          const { sheet, index } = info;
          newData.importedSheets.splice(index, 0, info);
        }

        newData.allImportedSheetUris = event.data.allImportedSheetUris;
      });
    } else if (event.kind === EngineDelegateEventKind.Diffed) {
      newData = produce(newData, (newData) => {
        const data = event.data as DiffedPCData;

        // re-order
        newData.importedSheets = data.allImportedSheetUris
          .map((importedUri) => {
            const oldIndex = newData.allImportedSheetUris.indexOf(importedUri);
            return newData.importedSheets[oldIndex];
          })
          .filter(Boolean);

        newData.allImportedSheetUris = data.allImportedSheetUris;
        newData.sheet = patchCSSSheet(newData.sheet, data.sheetMutations);
        newData.preview = patchVirtNode(
          newData.preview,
          event.data.mutations as Mutation[]
        );
      });
    }
  }

  return newData;
};
