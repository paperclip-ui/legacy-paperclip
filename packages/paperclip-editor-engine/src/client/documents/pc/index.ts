/**
 * Editable virtual object document
 */

import {
  EngineDelegateEvent,
  EngineDelegateEventKind,
  getNodeByPath,
  LoadedData,
  LoadedPCData,
  Mutation,
  patchVirtNode
} from "@paperclip-ui/utils";
import {
  openDocumentSourceChannel,
  engineEventChannel,
  VirtualObjectEdit
} from "../../../core";
import { CRDTTextDocument } from "../../../core/crdt-document";
import { DocumentKind } from "../../../core/documents";

import { BaseDocument } from "../base";
import { PCSourceDocument } from "./source";
import { FrameRenderingManager } from "./renderer";
import { EditorClientOptions } from "../../client";
import { createListener } from "../../../core/utils";
import { editVirtualObjectsChannel } from "../../../core/channels";
import { RPCClientAdapter } from "@paperclip-ui/common";

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
  // private _updateNodeAnnotations: ReturnType<typeof insertBeforeNodeChannel>;
  private _engineEvents: ReturnType<typeof engineEventChannel>;
  private _source?: PCSourceDocument;

  /**
   */

  constructor(
    uri: string,
    connection: RPCClientAdapter,
    private _options: EditorClientOptions
  ) {
    super(uri, connection);
    this._openDocumentSource = openDocumentSourceChannel(connection);
    this._engineEvents = engineEventChannel(connection);
    this._editVirtualObject = editVirtualObjectsChannel(connection);
    this._engineEvents.listen(this._onEngineEvent);
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

  createRenderer() {
    return new FrameRenderingManager(this, this._options);
  }

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

    return (this._source = new PCSourceDocument(
      this.uri,
      CRDTTextDocument.load(await this._openDocumentSource.call(this.uri)),
      this._connection
    ));
  }

  /**
   * synchronous by default because it needs to be
   */

  editVirtualObjects(edits: VirtualObjectEdit[]) {
    this._editVirtualObject.call({ [this.uri]: edits });
  }

  /**
   */

  updateNodeAnnotations(nodePath: string, annotations: Object) {}

  /**
   */

  private _onEngineEvent = async (event: EngineDelegateEvent) => {
    if (event.uri !== this.uri) {
      return;
    }
    let newData: LoadedPCData = {
      ...this._content
    };

    if (event.kind === EngineDelegateEventKind.Loaded) {
      newData = event.data as LoadedPCData;
    } else if (event.kind === EngineDelegateEventKind.Diffed) {
      newData.preview = patchVirtNode(
        newData.preview,
        event.data.mutations as Mutation[]
      );
    }

    this._updateContent(newData);
    this._em.emit("appliedChanges", this._content, event);
  };
}
