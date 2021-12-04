import { actionCreator, BaseAction } from "./base";

export enum ExternalActionType {
  OPENED_DOCUMENT = "OPENED_DOCUMENT",
  CONTENT_CHANGED = "CONTENT_CHANGED",
  CONFIG_CHANGED = "CONFIG_CHANGED",
}

type ContentChange = {
  rangeOffset: number;
  rangeLength: number;
  text: string;
};

export type ContentChanged = BaseAction<
  ExternalActionType.CONTENT_CHANGED,
  {
    fileUri: string;
    changes: ContentChange[];
  }
>;

export type OpenedDocument = BaseAction<
  ExternalActionType.OPENED_DOCUMENT,
  {
    fileUri: string;
    content: string;
  }
>;

export type ConfigChanged = BaseAction<
  ExternalActionType.CONFIG_CHANGED,
  {
    browserstackCredentials: {
      username: string;
      password: string;
    };
  }
>;

export const contentChanged = actionCreator<ContentChanged>(
  ExternalActionType.CONTENT_CHANGED
);
export const openedDocument = actionCreator<OpenedDocument>(
  ExternalActionType.OPENED_DOCUMENT
);
export const configChanged = actionCreator<ConfigChanged>(
  ExternalActionType.CONFIG_CHANGED
);

export type ExternalAction = OpenedDocument | ContentChanged | ConfigChanged;
