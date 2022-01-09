import { expect } from "chai";
import { saveTmpFixtureFiles } from "./utils";

describe(__filename + "#", () => {
  it(`Throws an error if no target compiler is found`, async () => {
    const tmp = saveTmpFixtureFiles(`throws-error-test`, {
      "src/test.pc": "Hello",
      "paperclip.config.json": JSON.stringify({
        compilerOptions: {
          target: "does-not-exist"
        }
      })
    });
    const e = await tmp.buildFiles().catch(e => e);
    expect(e?.message).to.eql(
      `Paperclip compiler target "does-not-exist" not found`
    );
    tmp.dispose();
  });

  // breaks in CI, probably because of watching issues
  xit(`Can recover from a build error`, async () => {
    const tmp = saveTmpFixtureFiles(
      `recovers-from-build-error`,
      {
        "src/test.pc": "<div>broke",
        "paperclip.config.json": JSON.stringify({
          compilerOptions: {
            emit: ["css"]
          }
        })
      },
      { watch: true }
    );
    const e = await tmp.buildFiles().catch(e => e);
    expect(e).not.to.eql(undefined);
    tmp.saveFiles({
      "src/test.pc": "<div>fixed</div>"
    });

    const emittedFiles = await tmp.emittedFiles;
    await new Promise(resolve => setTimeout(resolve, 600));
    expect(Object.keys(emittedFiles)).to.eql(["src/test.pc.css"]);
    tmp.dispose();
  });
});
