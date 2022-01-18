import { patchFrames, renderFrames } from "..";
import { createMockEngine } from "@paperclip-ui/core/lib/test/utils";
import { combineFrameHTML, mockDOMFactory } from "./utils";
import { expect } from "chai";

describe(__filename + "#", () => {
  it(`Can render simple frames`, () => {
    const engine = createMockEngine({
      "hello.pc": `<style>div {color: red;}</style><div>Hello world</div>`
    });
    const frames = renderFrames(engine.open("hello.pc"), {
      domFactory: mockDOMFactory
    });

    expect(frames.map(frame => frame.innerHTML).join("")).to.eql(
      `<div></div><div><style>div._cb99d41f {color: red;} </style></div><div class="_cb99d41f _pub-cb99d41f">Hello world</div>`
    );
  });

  it(`Can render frames with imported CSS`, () => {
    const engine = createMockEngine({
      "hello.pc": `
      <import src="/imp.css" />
      <style>div {color: red;}</style><div>Hello world</div>`,
      "/imp.css": `div {color: blue;}`
    });
    const frames = renderFrames(engine.open("hello.pc"), {
      domFactory: mockDOMFactory
    });

    expect(frames.map(frame => frame.innerHTML).join("")).to.eql(
      `<div><style>div._pub-2c5dbed5 {color: blue;} </style></div><div><style>div._cb99d41f {color: red;} </style></div><div class="_cb99d41f _pub-cb99d41f">Hello world</div>`
    );
  });

  [
    [
      `Can remove a frame`,
      {
        "hello.pc": "<div></div>"
      },
      {
        "hello.pc": "blah"
      }
    ]
  ].forEach(([title, ...graphs]: any) => {
    it(title, () => {
      console.log(graphs);
      const engine = createMockEngine(graphs[0]);
      let data = engine.open("hello.pc");
      let frames = renderFrames(data, { domFactory: mockDOMFactory });
      for (let i = 1; i < graphs.length; i++) {
        const graph = graphs[i];
        for (const name in graph) {
          engine.updateVirtualFileContent(name, graph[name]);
        }
        const newData = engine.open("hello.pc");
        frames = patchFrames(frames, data, newData, {
          domFactory: mockDOMFactory
        });
        const newFrames = renderFrames(newData, { domFactory: mockDOMFactory });
        expect(frames.map(frame => frame.innerHTML).join("")).to.eql(
          newFrames.map(frame => frame.innerHTML).join("")
        );
      }
    });
  });
});
