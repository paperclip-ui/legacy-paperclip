import { generateRandomPaperclipDocument } from "./random";
import { expect } from "chai";
import { createMockEngine, createMockFramesRenderer } from "./utils";
import { repeat } from "lodash";

describe(__filename + "#", () => {
  xit("passes the fuzzy test", async () => {
    const randOptions = {
      minWidth: 1,
      maxWidth: 4,
      minDepth: 1,
      maxDepth: 4
    };

    let currentDocumentSource = generateRandomPaperclipDocument(randOptions);

    const graph = {
      "/entry.pc": currentDocumentSource
    };

    const engine = await createMockEngine(graph);

    const renderer = createMockFramesRenderer("/entry.pc");
    engine.onEvent(renderer.handleEngineDelegateEvent);
    await engine.open("/entry.pc");

    // console.log("C", currentDocumentSource);
    for (let i = 50; i--; ) {
      const randomDocument = generateRandomPaperclipDocument(randOptions);

      // too lazy to fix
      if (!randomDocument.trim()) {
        continue;
      }

      const baselineEngine = await createMockEngine({
        "/entry.pc": randomDocument
      });

      try {
        const baselineRenderer = createMockFramesRenderer("/entry.pc");
        baselineEngine.onEvent(baselineRenderer.handleEngineDelegateEvent);
        await baselineEngine.open("/entry.pc");

        await engine.updateVirtualFileContent("/entry.pc", randomDocument);
        expect(renderer.immutableFrames.length).to.eql(
          baselineRenderer.immutableFrames.length
        );

        for (
          let i = 0, { length } = renderer.immutableFrames;
          i < length;
          i++
        ) {
          const frameA = renderer.immutableFrames[i];
          const frameB = baselineRenderer.immutableFrames[i];
          expect(frameA._mount.innerHTML).to.eql(frameB._mount.innerHTML);
        }

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
