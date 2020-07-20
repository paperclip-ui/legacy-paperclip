import { GeneratorKind } from "./base";

// TODO - prompt to setup Git hooks

export const percy = {
  kind: GeneratorKind.Percy,
  prepare() {
    return {
      [GeneratorKind.Node]: {
        scripts: {
          snapshot: ["percy -- --percy-paperclip"]
        },
        devDependencies: ["percy", "percy-paperclip"]
      }
    };
  }
};
