export type EditorClientOptions = {
  hostname?: string;
  port: number;
};

export class EditorClient {
  /**
   */

  constructor(readonly options: EditorClientOptions) {}

  /**
   * Opens a new editable document
   */

  async open(documentUri: string) {}
}
