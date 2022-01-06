import { PaperclipConfig, buildCompilerOptions } from "../core/config";
import { expect } from "chai";

describe(__filename + "#", () => {
  describe("Compiler options", () => {
    it(`can be built from non-array config`, () => {
      const options = buildCompilerOptions({
        srcDir: "./src",
        compilerOptions: {
          outDir: "a"
        }
      });
      expect(options).to.eql([{ outDir: "a" }]);
    });
    it(`can be built from an array config`, () => {
      const options = buildCompilerOptions({
        srcDir: "./src",
        compilerOptions: [
          {
            outDir: "a"
          },
          {
            outDir: "b"
          }
        ]
      });
      expect(options).to.eql([{ outDir: "a" }, { outDir: "b" }]);
    });
    it(`can be built from an array `, () => {
      const options = buildCompilerOptions({
        srcDir: "./src",
        compilerOptions: [
          {
            outDir: "b"
          },
          {
            outDir: "c"
          }
        ]
      });
      expect(options).to.eql([{ outDir: "b" }, { outDir: "c" }]);
    });
    it(`generates compiler options anyways if not specified `, () => {
      const options = buildCompilerOptions({
        srcDir: "./src"
      });
      expect(options).to.eql([{ outDir: "./src" }]);
    });
    it(`sets outdir as srcDir is not specified`, () => {
      const options = buildCompilerOptions({
        srcDir: "./src",
        compilerOptions: {}
      });
      expect(options).to.eql([{ outDir: "./src" }]);
    });
  });
});
