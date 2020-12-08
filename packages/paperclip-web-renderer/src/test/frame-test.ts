import {
  createMockEngineDelegate,
  createMockFramesRenderer,
  trimWS
} from "./utils";
import { expect } from "chai";

describe(__filename + "#", () => {
  it("can render a simple frame", async () => {
    const engine = await createMockEngineDelegate({
      "/entry.pc": `<div>
          <style>
            color: red;
          </style>
          Hello world
        </div>`
    });

    const renderer = createMockFramesRenderer("/entry.pc");
    engine.onEvent(ev => {
      try {
        renderer.handleEngineDelegateEvent(ev);
      } catch (e) {
        console.error(e);
      }
    });

    engine.open("/entry.pc");
    expect(trimWS(renderer.frames[0].stage.innerHTML)).to.eql(
      `<div></div><div><style>[data-pc-406d2856][data-pc-406d2856] { color:red; }</style></div><div><div> Hello world </div></div>`
    );
  });

  it(`re-rendered updated content`, async () => {
    const engine = await createMockEngineDelegate({
      "/entry.pc": `<div>
          Hello world
        </div>`
    });

    const renderer = createMockFramesRenderer("/entry.pc");
    engine.onEvent(ev => {
      try {
        renderer.handleEngineDelegateEvent(ev);
      } catch (e) {
        console.error(e);
      }
    });

    engine.open("/entry.pc");
    expect(trimWS(renderer.frames[0].stage.innerHTML)).to.eql(
      `<div></div><div><style></style></div><div><div>Hello world </div></div>`
    );
    engine.updateVirtualFileContent("/entry.pc", "span man");
    expect(trimWS(renderer.frames[0].stage.innerHTML)).to.eql(
      `<div></div><div><style></style></div><div>span man</div>`
    );
  });

  it(`renderes root children as multiple frames`, async () => {
    const engine = await createMockEngineDelegate({
      "/entry.pc": `a<span>b</span>`
    });

    const renderer = createMockFramesRenderer("/entry.pc");
    engine.onEvent(renderer.handleEngineDelegateEvent);
    engine.open("/entry.pc");
    expect(renderer.frames.length).to.eql(2);
    expect(trimWS(renderer.frames[0].stage.innerHTML)).to.eql(
      `<div></div><div><style></style></div><div>a</div>`
    );
    expect(trimWS(renderer.frames[1].stage.innerHTML)).to.eql(
      `<div></div><div><style></style></div><div><span>b</span></div>`
    );

    // test update
    engine.updateVirtualFileContent("/entry.pc", "a<span>c</span>");
    expect(trimWS(renderer.frames[0].stage.innerHTML)).to.eql(
      `<div></div><div><style></style></div><div>a</div>`
    );
    expect(trimWS(renderer.frames[1].stage.innerHTML)).to.eql(
      `<div></div><div><style></style></div><div><span>c</span></div>`
    );
  });

  xit(`main sheet is updated when it changes`);
  xit(`fragments are rendered as their own frame`);
  xit(`fragment children can change`);
  xit(`imported sheet is removed when import is deleted`);
  xit(`imported sheets across multiple frames when import changes`);
});
