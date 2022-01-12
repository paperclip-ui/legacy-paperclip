import {
  createMockEngineDelegate,
  createMockFramesRenderer,
  trimWS
} from "./utils";
import { expect } from "chai";
import { EngineMode } from "@paperclip-ui/core";

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
    expect(trimWS(renderer.getState().frames[0].stage.innerHTML)).to.eql(
      `<div></div><div><style>._406d2856._406d2856 {color: red;} </style></div><div><div class="_80f4925f _pub-80f4925f _406d2856"> Hello world </div></div>`
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
    expect(trimWS(renderer.getState().frames[0].stage.innerHTML)).to.eql(
      `<div></div><div><style></style></div><div><div class="_80f4925f _pub-80f4925f"> Hello world </div></div>`
    );
    engine.updateVirtualFileContent("/entry.pc", "span man");
    expect(trimWS(renderer.getState().frames[0].stage.innerHTML)).to.eql(
      `<div></div><div><style></style></div><div>span man</div>`
    );
  });

  it(`renderes root children as multiple getState().frames`, async () => {
    const engine = await createMockEngineDelegate({
      "/entry.pc": `a<span>b</span>`
    });

    const renderer = createMockFramesRenderer("/entry.pc");
    engine.onEvent(renderer.handleEngineDelegateEvent);
    engine.open("/entry.pc");
    expect(renderer.getState().frames.length).to.eql(2);
    expect(trimWS(renderer.getState().frames[0].stage.innerHTML)).to.eql(
      `<div></div><div><style></style></div><div>a</div>`
    );
    expect(trimWS(renderer.getState().frames[1].stage.innerHTML)).to.eql(
      `<div></div><div><style></style></div><div><span class="_80f4925f _pub-80f4925f">b</span></div>`
    );

    // test update
    engine.updateVirtualFileContent("/entry.pc", "a<span>c</span>");
    expect(trimWS(renderer.getState().frames[0].stage.innerHTML)).to.eql(
      `<div></div><div><style></style></div><div>a</div>`
    );
    expect(trimWS(renderer.getState().frames[1].stage.innerHTML)).to.eql(
      `<div></div><div><style></style></div><div><span class="_80f4925f _pub-80f4925f">c</span></div>`
    );
  });

  it(`main style is shared across all getState().frames`, async () => {
    const graph = {
      "/entry.pc": `<style>div {
        color: red;
      }</style><div>a</div><div>b</div>`
    };
    const engine = await createMockEngineDelegate(graph);
    const renderer = createMockFramesRenderer("/entry.pc");
    engine.onEvent(renderer.handleEngineDelegateEvent);
    engine.open("/entry.pc");
    expect(trimWS(renderer.getState().frames[0].stage.innerHTML)).to.eql(
      `<div></div><div><style>div._80f4925f {color: red;} </style></div><div><div class="_80f4925f _pub-80f4925f">a</div></div>`
    );
    expect(trimWS(renderer.getState().frames[1].stage.innerHTML)).to.eql(
      `<div></div><div><style>div._80f4925f {color: red;} </style></div><div><div class="_80f4925f _pub-80f4925f">b</div></div>`
    );
  });

  // it(`main sheet is updated when it changes`, () => {

  // });
  xit(`fragments are rendered as their own frame`);
  xit(`fragment children can change`);
  xit(`imported sheet is removed when import is deleted`);
  xit(`imported sheets across multiple getState().frames when import changes`);
  it(`properly renders with protocol`, async () => {
    const graph = {
      "file:///entry.pc": `<img src="/file.jpeg" />`,
      "file:///file.jpeg": "a"
    };

    const renderer = createMockFramesRenderer("file:///entry.pc", url =>
      url.replace("file", "blah")
    );
    const engine = await createMockEngineDelegate(graph);
    engine.onEvent(renderer.handleEngineDelegateEvent);
    await engine.open("file:///entry.pc");
    expect(renderer.getState().frames.length).to.eql(1);
    expect(trimWS(renderer.getState().frames[0].stage.innerHTML)).to.eql(
      `<div></div><div><style></style></div><div><img class="_80f4925f _pub-80f4925f" src="blah:///file.jpeg"></img></div>`
    );
  });

  it(`renders fragments as a single frame`, async () => {
    const graph = {
      "/entry.pc": `<fragment>a<span>b</span></fragment>`
    };
    const renderer = createMockFramesRenderer("/entry.pc");
    const engine = await createMockEngineDelegate(graph, EngineMode.MultiFrame);
    engine.onEvent(renderer.handleEngineDelegateEvent);
    await engine.open("/entry.pc");

    expect(renderer.getState().frames.length).to.eql(1);
    expect(trimWS(renderer.getState().frames[0].stage.innerHTML)).to.eql(
      `<div></div><div><style></style></div><div><fragment class="_80f4925f _pub-80f4925f">a<span class="_80f4925f _pub-80f4925f">b</span></fragment></div>`
    );
  });

  it(`flattens nested fragments`, async () => {
    const graph = {
      "/entry.pc": `<fragment><fragment>a<span>b</span></fragment></fragment>`
    };
    const renderer = createMockFramesRenderer("/entry.pc");
    const engine = await createMockEngineDelegate(graph, EngineMode.MultiFrame);
    engine.onEvent(renderer.handleEngineDelegateEvent);
    await engine.open("/entry.pc");

    expect(renderer.getState().frames.length).to.eql(1);
    expect(trimWS(renderer.getState().frames[0].stage.innerHTML)).to.eql(
      `<div></div><div><style></style></div><div><fragment class="_80f4925f _pub-80f4925f">a<span class="_80f4925f _pub-80f4925f">b</span></fragment></div>`
    );
  });

  it(`can remove & add an element`, async () => {
    const graph = {
      "/entry.pc": `<span />b`
    };
    const renderer = createMockFramesRenderer("/entry.pc");
    const engine = await createMockEngineDelegate(graph, EngineMode.MultiFrame);
    engine.onEvent(renderer.handleEngineDelegateEvent);
    await engine.open("/entry.pc");
    expect(trimWS(renderer.getState().frames[0].stage.innerHTML)).to.eql(
      `<div></div><div><style></style></div><div><span class="_80f4925f _pub-80f4925f"></span></div>`
    );
    engine.updateVirtualFileContent("/entry.pc", "b");

    expect(trimWS(renderer.getState().frames[0].stage.innerHTML)).to.eql(
      `<div></div><div><style></style></div><div>b</div>`
    );
    engine.updateVirtualFileContent("/entry.pc", "<span />b");
    expect(trimWS(renderer.getState().frames[0].stage.innerHTML)).to.eql(
      `<div></div><div><style></style></div><div><span class="_80f4925f _pub-80f4925f"></span></div>`
    );
  });

  it(`Adds styles from imported module to new frame`, async () => {
    const graph = {
      "/entry.pc": `<import src="/mod.pc" />a`,
      "/mod.pc": `<style>a { color: blue }</style>`
    };
    const renderer = createMockFramesRenderer("/entry.pc");
    const engine = await createMockEngineDelegate(graph, EngineMode.MultiFrame);
    engine.onEvent(renderer.handleEngineDelegateEvent);
    await engine.open("/entry.pc");
    expect(trimWS(renderer.getState().frames[0].stage.innerHTML)).to.eql(
      `<div><style>a._c938aea3 {color: blue;} </style></div><div><style></style></div><div>a</div>`
    );
    engine.updateVirtualFileContent(
      "/entry.pc",
      `<import src="/mod.pc" /><span /><!-- @frame { } --><div />`
    );
    expect(trimWS(renderer.getState().frames[1].stage.innerHTML)).to.eql(
      `<div><style>a._c938aea3 {color: blue;} </style></div><div><style></style></div><div><div class="_80f4925f _pub-80f4925f"></div></div>`
    );
  });
});
