import { FrameRenderer } from "../frame-renderer";
import { createMockEngineDelegate, createMockFramesRenderer } from "./utils";

describe(__filename + "#", () => {
  it("can render a simple frame", async () => {
    const engine = await createMockEngineDelegate({
      "/entry.pc": `
        <div>
          Hello world
        </div>
      `
    });

    const renderer = createMockFramesRenderer(engine, "/entry.pc");
    engine.open("/entry.pc");
    engine.updateVirtualFileContent("/entry.pc", "CONTENT");
  });
});
