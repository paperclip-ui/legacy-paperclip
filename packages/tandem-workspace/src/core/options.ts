import { ContentChange } from "@paperclipui/source-writer";
import { ExprSource } from "@paperclipui/utils";

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

  standalone?: boolean;
  showFullEditor?: boolean;

  // Canvas file to open if none are present. Used particularly
  // for codespaces
  canvasFile?: string;

  // branch of project
  branch?: string;
  project?: ProjectOptions;

  adapter?: WorkspaceAdapter;
};
