import { expect } from "chai";
import { requireTargetCompilers } from "../resolve-compilers";
import { saveTmpFixtureFiles } from "./utils";

describe(__filename + "*", () => {
  it(`Can explicitly define a target compiler`, () => {
    const tmp = saveTmpFixtureFiles(`can-explicitly-define-target-compiler`, {
      "node_modules/my-test-compiler/index.js": `exports.compile = () => {}; exports.name = "test";`
    });

    const targetCompilers = requireTargetCompilers(tmp.testDir, {
      target: "my-test-compiler",
      outDir: "blah"
    });

    const compiler = targetCompilers[0];

    expect((compiler as any).name).to.eql("test");

    tmp.dispose();
  });
  it(`resolves modules from the @paperclip-ui directory`, () => {
    const tmp = saveTmpFixtureFiles(`can-explicitly-define-target-compiler3`, {
      "node_modules/@paperclip-ui/compiler-test/index.js": `exports.compile = () => {}; exports.name = "test2";`
    });

    const targetCompilers = requireTargetCompilers(tmp.testDir, {
      outDir: "blah"
    });

    const compiler = targetCompilers[0];

    expect((compiler as any).name).to.eql("test2");

    tmp.dispose();
  });

  it(`ignores compiles without the compile prop`, () => {
    const tmp = saveTmpFixtureFiles(`can-explicitly-define-target-compiler4`, {
      "node_modules/@paperclip-ui/compiler-test/index.js": `exports.compile2 = () => {}; exports.name = "test2";`
    });

    const targetCompilers = requireTargetCompilers(tmp.testDir, {
      target: "test",
      outDir: "blah"
    });

    expect(targetCompilers.length).to.eql(0);

    tmp.dispose();
  });

  it(`ignores modules with compiler- prefix that aren't in the @paperclipui directory`, () => {
    const tmp = saveTmpFixtureFiles(`can-explicitly-define-target-compiler-6`, {
      "node_modules/compiler-test/index.js": `exports.compile = () => {}; exports.name = "test2";`
    });

    const targetCompilers = requireTargetCompilers(tmp.testDir, {
      target: "test",
      outDir: "blah"
    });

    expect(targetCompilers.length).to.eql(0);

    tmp.dispose();
  });

  it(`Can explicitly reference compilers with compiler- prefix`, () => {
    const tmp = saveTmpFixtureFiles(`can-explicitly-define-target-compiler-6`, {
      "node_modules/compiler-test/index.js": `exports.compile = () => {}; exports.name = "test2";`
    });

    const targetCompilers = requireTargetCompilers(tmp.testDir, {
      target: "compiler-test",
      outDir: "blah"
    });

    expect(targetCompilers.length).to.eql(1);

    tmp.dispose();
  });
});
