import * as path from "path";

export const TEST_FIXTURES_DIR = path.join(
  __dirname,
  "/../../../src/test/all/fixtures"
);

export const TEST_FIXTURES_PCCONFIG_DIR = path.join(
  TEST_FIXTURES_DIR,
  "with-pcconfig"
);

export const FIXTURE_FILE_PATHS = {
  helloWorldPc: path.join(TEST_FIXTURES_DIR, "hello-world.pc")
};

export const FIXTURE_PCCONFIG_FILE_PATHS = {
  empty: path.join(TEST_FIXTURES_PCCONFIG_DIR, "empty.pc")
};
