import { generateRandomPaperclipDocument } from "./random";
import { expect } from "chai";
import { createMockEngine, createMockRenderer } from "./utils";
import { repeat } from "lodash";

describe(__filename + "#", () => {
  it("passes the fuzzy test", async () => {
    const randOptions = {
      minWidth: 2,
      maxWidth: 6,
      minDepth: 1,
      maxDepth: 4,
    };

    let currentDocumentSource = generateRandomPaperclipDocument(randOptions);

    const graph = {
      "/entry.pc": currentDocumentSource,
    };

    const engine = await createMockEngine(graph);

    const renderer = createMockRenderer("/entry.pc");
    engine.onEvent(renderer.handleEngineDelegateEvent);
    await engine.open("/entry.pc");

    for (let i = 30; i--; ) {
      const randomDocument = generateRandomPaperclipDocument(randOptions);
      const baselineEngine = await createMockEngine({
        "/entry.pc": randomDocument,
      });

      try {
        const baselineRenderer = createMockRenderer("/entry.pc");
        baselineEngine.onEvent(baselineRenderer.handleEngineDelegateEvent);
        await baselineEngine.open("/entry.pc");

        await engine.updateVirtualFileContent("/entry.pc", randomDocument);

        expect(renderer.mount.innerHTML).to.eql(
          baselineRenderer.mount.innerHTML
        );

        currentDocumentSource = randomDocument;
      } catch (e) {
        console.error(`Fuzzy test failed to diff & patch:\n`);
        console.error(repeat("-", 80));
        console.error(currentDocumentSource);
        console.error(repeat("-", 80));
        console.error(repeat("-", 37) + " into " + repeat("-", 37));
        console.error(repeat("-", 80));
        console.error(randomDocument);
        console.error(repeat("-", 80));
        throw e;
      }
    }
  });
});
