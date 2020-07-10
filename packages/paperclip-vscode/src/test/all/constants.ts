import * as path from "path";

export const TEST_FIXTURES_DIR = path.join(
  __dirname,
  "/../../../src/test/all/fixtures"
);

export const FIXTURE_FILE_PATHS = {
  helloWorldPc: path.join(TEST_FIXTURES_DIR, "hello-world.pc")
};
