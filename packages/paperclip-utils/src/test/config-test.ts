import { PaperclipConfig, buildCompilerOptions } from "../core/config";
import { expect } from "chai";

describe(__filename + "#", () => {
  describe("Compiler options", () => {
    it(`Undefined compilerOptions results in an empty array`, () => {
      const options = buildCompilerOptions({
        srcDir: "./src"
      });
      expect(options).to.eql([]);
    });
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
  });
});
