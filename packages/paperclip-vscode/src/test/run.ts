import * as path from "path";
import { runTests } from "vscode-test";

const run = async () => {
  const extensionDevelopmentPath = path.resolve(__dirname, "../../");
  const extensionTestsPath = path.resolve(__dirname, "./index");

  await runTests({
    extensionDevelopmentPath,
    extensionTestsPath
  });
};

run().catch(e => {
  console.error(e);
  process.exit(1);
});
