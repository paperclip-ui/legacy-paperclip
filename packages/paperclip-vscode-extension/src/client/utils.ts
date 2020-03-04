export const isPaperclipFile = (uri: string) => /.pc$/.test(uri);
export const isCSSFile = (uri: string) => /.css$/.test(uri);
export const isPaperclipCompatibleFile = (uri: string) =>
  isPaperclipFile(uri) || isCSSFile(uri);
