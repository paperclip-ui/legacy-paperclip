import { patchFrame, patchFrames, renderFrame, renderFrames } from "..";
import { createMockEngine } from "@paperclip-ui/core/lib/test/utils";
import { mockDOMFactory } from "./utils";
import { expect } from "chai";
import { LoadedPCData } from "@paperclip-ui/utils";

describe(__filename + "#", () => {
  it(`Can render simple frames`, () => {
    const engine = createMockEngine({
      "hello.pc": `<style>div {color: red;}</style><div>Hello world</div>`,
    });
    const frames = renderFrames(engine.open("hello.pc"), {
      domFactory: mockDOMFactory,
    });

    expect(frames.map((frame) => frame.innerHTML).join("")).to.eql(
      `<div></div><div><style>div._cb99d41f {color: red;} </style></div><div><div class="_cb99d41f _pub-cb99d41f">Hello world</div></div>`
    );
  });

  it(`Can render frames with imported CSS`, () => {
    const engine = createMockEngine({
      "hello.pc": `
      <import src="/imp.css" />
      <style>div {color: red;}</style><div>Hello world</div>`,
      "/imp.css": `div {color: blue;}`,
    });
    const frames = renderFrames(engine.open("hello.pc"), {
      domFactory: mockDOMFactory,
    });

    expect(frames.map((frame) => frame.innerHTML).join("")).to.eql(
      `<div><style>div._pub-2c5dbed5 {color: blue;} </style></div><div><style>div._cb99d41f {color: red;} </style></div><div><div class="_cb99d41f _pub-cb99d41f">Hello world</div></div>`
    );
  });
  it(`Can a render a slot`, () => {
    const engine = createMockEngine({
      "hello.pc": `<div component as="Test">{child}</div><Test />`,
    });
    const frames = renderFrames(engine.open("hello.pc"), {
      domFactory: mockDOMFactory,
      showSlotPlaceholders: true,
    });

    expect(frames.map((frame) => frame.innerHTML).join("")).to.eql(
      `<div></div><div><style></style></div><div><div class="_cb99d41f _pub-cb99d41f"><div style="border: 1px dashed #F0F; padding: 30px; box-sizing: border-box;"></div></div></div>`
    );
  });

  it(`Hides slots by default`, () => {
    const engine = createMockEngine({
      "hello.pc": `<div component as="Test">{child}</div><Test />`,
    });
    const frames = renderFrames(engine.open("hello.pc"), {
      domFactory: mockDOMFactory,
      showSlotPlaceholders: false,
    });

    expect(frames.map((frame) => frame.innerHTML).join("")).to.eql(
      `<div></div><div><style></style></div><div><div class="_cb99d41f _pub-cb99d41f"></div></div>`
    );
  });

  it(`Can render a single frame`, () => {
    const engine = createMockEngine({
      "hello.pc": `a<span />`,
    });
    const frame = renderFrame(engine.open("hello.pc"), 0, {
      domFactory: mockDOMFactory,
    });

    expect(frame.innerHTML).to.eql(
      `<div></div><div><style></style></div><div>a</div>`
    );
  });

  it(`Can patch a single frame`, () => {
    const engine = createMockEngine({
      "hello.pc": `a<span />`,
    });
    const content = engine.open("hello.pc");
    const frame = renderFrame(content, 0, {
      domFactory: mockDOMFactory,
    });

    engine.updateVirtualFileContent("hello.pc", "bbb");
    const newContent = engine.open("hello.pc");
    patchFrame(frame, 0, content, newContent, { domFactory: mockDOMFactory });

    expect(frame.innerHTML).to.eql(
      `<div></div><div><style></style></div><div>bbb</div>`
    );
  });
  it(`Properly renders with a protocol`, async () => {
    const graph = {
      "/entry.pc": `
        <img src="/file.jpg" />
      `,
      "/file.jpg": `a`,
      "/something-else.jpg": `a`,
    };

    const engine = createMockEngine(graph);
    const resolveUrl = (url) => "blah://" + url;
    const frames = renderFrames(engine.open("/entry.pc") as any, {
      domFactory: mockDOMFactory,
      resolveUrl,
    });

    expect(frames.map((frame) => frame.innerHTML).join("")).to.eql(
      `<div></div><div><style></style></div><div><img class="_80f4925f _pub-80f4925f" src="blah:///file.jpg"></img></div>`
    );

    const prevData = engine.open("/entry.pc") as any;

    engine.updateVirtualFileContent(
      "/entry.pc",
      `
      <img src="./something-else.jpg" />
    `
    );

    patchFrames(frames, prevData, engine.open("/entry.pc") as any, {
      domFactory: mockDOMFactory,
      resolveUrl,
    });

    expect(frames.map((frame) => frame.innerHTML).join("")).to.eql(
      `<div></div><div><style></style></div><div><img class="_80f4925f _pub-80f4925f" src="blah:///something-else.jpg"></img></div>`
    );
  });

  [
    [
      `Can replace a frame`,
      {
        "hello.pc": "<div></div>",
      },
      {
        "hello.pc": "blah",
      },
    ],
    [
      `Replaces a node if the tag name doesn't match`,
      {
        "hello.pc": "<div></div>",
      },
      {
        "hello.pc": "<span />",
      },
    ],
    [
      `Adds a frame`,
      {
        "hello.pc": "a",
      },
      {
        "hello.pc": "a<span />",
      },
    ],
    [
      `Removes a frame`,
      {
        "hello.pc": "a<span />",
      },
      {
        "hello.pc": "<span />",
      },
    ],
    [
      `Adds a child`,
      {
        "hello.pc": "<span></span>",
      },
      {
        "hello.pc": "<span>a</span>",
      },
    ],
    [
      `Removes a child`,
      {
        "hello.pc": "<span>a</span>",
      },
      {
        "hello.pc": "<span></span>",
      },
    ],
    [
      `Can change text value`,
      {
        "hello.pc": "a",
      },
      {
        "hello.pc": "b",
      },
    ],
    [
      `Can change style`,
      {
        "hello.pc": "<style>span { color: blue;}</style>a",
      },
      {
        "hello.pc": "<style>div { color: red;}</style>a",
      },
    ],
    [
      `Can insert a style`,
      {
        "hello.pc": "<style>span { color: blue;}</style>a",
      },
      {
        "hello.pc": "<style>div { color: red;} div { color: black; }</style>a",
      },
    ],
    [
      `Can remove a style`,
      {
        "hello.pc":
          "<style>span { color: blue;} div { color: black; }</style>a",
      },
      {
        "hello.pc": "<style>div { color: red;}</style>a",
      },
    ],
    [
      `Can add style in import`,
      {
        "hello.pc": "<import src='imp.pc' />a",
        "imp.pc": "<style>div { color: blue }</style>",
      },
      {
        "hello.pc": "<import src='imp.pc' />a",
        "imp.pc": "<style>div { color: blue } span { color: black } </style>",
      },
    ],
    [
      `Can add an import`,
      {
        "hello.pc": "<import src='imp.pc' />a",
        "imp.pc": "<style>div { color: blue }</style>",
        "imp2.pc": "<style>div { color: orange } </style>",
      },
      {
        "hello.pc": "<import src='imp.pc' /><import src='imp2.pc' />a",
        "imp2.pc": "<style>div { color: orange } </style>",
      },
    ],
    [
      `Can remove an import`,
      {
        "hello.pc": "<import src='imp.pc' /><import src='imp2.pc' />a",
        "imp.pc": "<style>div { color: blue }</style>",
        "imp2.pc": "<style>div { color: orange } </style>",
      },
      {
        "hello.pc": "<import src='imp.pc' />a",
      },
    ],
    [
      `Can remove an in an import`,
      {
        "hello.pc": "<import src='imp.pc' /><import src='imp2.pc' />a",
        "imp.pc": "<style>div { color: blue }</style>",
        "imp2.pc": "<style>div { color: orange } </style>",
        "imp3.pc": "<style>div { color: magenta } </style>",
      },
      {
        "imp2.pc":
          "<import src='imp3.pc' /><style>div { color: orange } </style>",
      },
    ],
    [
      `Can add an attribute`,
      {
        "hello.pc": `<div></div>`,
      },
      {
        "hello.pc": `<div a="b"></div>`,
      },
    ],
    [
      `Can remove an attribute`,
      {
        "hello.pc": `<div a="b"></div>`,
      },
      {
        "hello.pc": `<div></div>`,
      },
    ],
    [
      `can patch a slot`,
      {
        "hello.pc": `<div component as="Test">{child}</div><Test />`,
      },
      {
        "hello.pc": `<div component as="Test">{child}</div><Test child='b' />`,
      },
    ],
  ].forEach(([title, ...graphs]: any) => {
    it(title, () => {
      const engine = createMockEngine(graphs[0]);
      const data = engine.open("hello.pc");
      let frames = renderFrames(data, { domFactory: mockDOMFactory });
      for (let i = 1; i < graphs.length; i++) {
        const graph = graphs[i];
        for (const name in graph) {
          engine.updateVirtualFileContent(name, graph[name]);
        }
        const newData = engine.open("hello.pc");
        frames = patchFrames(frames, data, newData, {
          domFactory: mockDOMFactory,
        });
        const newFrames = renderFrames(newData, { domFactory: mockDOMFactory });
        expect(frames.map((frame) => frame.innerHTML).join("")).to.eql(
          newFrames.map((frame) => frame.innerHTML).join("")
        );
      }
    });
  });
});
