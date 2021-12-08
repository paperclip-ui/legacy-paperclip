import { ContentChange } from "paperclip-source-writer";
import { ExprSource } from "paperclip-utils";

export type ProjectOptions = {
  installDependencies?: boolean;
};

export type WorkspaceAdapter = {
  revealSource: (source: ExprSource) => void;
  applyCodeChanges: (changes: Record<string, ContentChange[]>) => void;
};

export type Options = {
  autoSave?: boolean;
  http?: {
    port: number;
  };

  // branch of project
  branch?: string;
  project?: ProjectOptions;

  adapter?: WorkspaceAdapter;
};
