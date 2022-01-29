import { generateRandomPaperclipDocument } from "./random";
import { expect } from "chai";
import { createMockEngine, mockDOMFactory } from "./utils";
import { repeat } from "lodash";
import { patchFrame, patchFrames, renderFrame, renderFrames } from "..";
import { LoadedPCData } from "@paperclip-ui/utils";

describe(__filename + "#", () => {
  xit("passes the fuzzy test", async () => {
    const randOptions = {
      minWidth: 1,
      maxWidth: 4,
      minDepth: 1,
      maxDepth: 4,
    };

    let currentDocumentSource = generateRandomPaperclipDocument(randOptions);

    const graph = {
      "/entry.pc": currentDocumentSource,
    };

    const engine = await createMockEngine(graph);

    let frames = renderFrames(engine.open("/entry.pc") as LoadedPCData, {
      domFactory: mockDOMFactory,
    });

    for (let i = 50; i--; ) {
      const randomDocument = generateRandomPaperclipDocument(randOptions);

      // too lazy to fix
      if (!randomDocument.trim()) {
        continue;
      }

      const baselineEngine = await createMockEngine({
        "/entry.pc": randomDocument,
      });

      try {
        const baselineFrames = renderFrames(
          baselineEngine.open("/entry.pc") as LoadedPCData,
          { domFactory: mockDOMFactory }
        );
        const oldData = engine.getLoadedData("/entry.pc") as LoadedPCData;

        await engine.updateVirtualFileContent("/entry.pc", randomDocument);
        frames = patchFrames(
          frames,
          oldData,
          engine.getLoadedData("/entry.pc") as LoadedPCData,
          { domFactory: mockDOMFactory }
        );

        for (let i = 0, { length } = frames; i < length; i++) {
          const frameA = frames[i];
          const frameB = baselineFrames[i];
          expect(frameA.innerHTML.replace(/[\n\s]/g, " ")).to.eql(
            frameB.innerHTML.replace(/[\n\s]/g, " ")
          );
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
