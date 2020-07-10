// Inspiration: https://github.com/vuejs/vetur/blob/master/test/codeTestRunner.ts
// https://github.com/microsoft/vscode-extension-samples/blob/master/helloworld-test-sample/src/test/suite/index.ts
// https://code.visualstudio.com/api/working-with-extensions/testing-extension

import * as glob from "glob";
import * as Mocha from "mocha";

export const run = async () => {
  const testFiles = glob.sync(`**/*-test.js`, {
    cwd: __dirname,
    realpath: true
  });

  const mocha = new Mocha({ ui: "bdd", timeout: 1000 * 10 });

  for (const filePath of testFiles) {
    mocha.addFile(filePath);
  }

  const runner = new Promise((resolve, reject) => {
    mocha.run(failures => {
      if (failures > 0) {
        const e = new Error(`${failures} tests failed`);
        console.error(e);
        reject(e);
      } else {
        resolve();
      }
    });
  });

  return runner;
};
