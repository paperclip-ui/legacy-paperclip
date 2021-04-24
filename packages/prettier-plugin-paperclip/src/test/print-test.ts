// Inspiration: https://github.com/sveltejs/prettier-plugin-svelte/blob/master/test/printer/index.ts

import { expect } from "chai";
import * as path from "path";
import * as fs from "fs";
import { format } from "prettier";

const fixturesDir = path.join(__dirname, "../../fixtures");

const fixtures = fs
  .readdirSync(fixturesDir)
  .filter(name => {
    return name.endsWith("-in.pc");
  })
  .map(name => path.join(fixturesDir, name));

describe(__dirname + "#", () => {
  for (const fixture of fixtures) {
    it(`properly formats ${path.basename(fixture)}`, () => {
      const out = fixture.replace("-in.pc", "-out.pc");
      const outExpected = fs.readFileSync(out, "utf-8");
      const input = fs.readFileSync(fixture, "utf-8");
      const output = format(input, {
        parser: "paperclip",
        plugins: [require.resolve("../../lib")],
        tabWidth: 2
      } as any);

      // console.log(output);

      expect(output).to.eql(outExpected);
    });
  }
});
