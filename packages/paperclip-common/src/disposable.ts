export type Disposable = {
  dispose: () => void;
};

export const disposableGroup = (disposables: Disposable[]) => ({
  dispose() {
    for (const disposable of disposables) {
      disposable.dispose();
    }
  }
});
