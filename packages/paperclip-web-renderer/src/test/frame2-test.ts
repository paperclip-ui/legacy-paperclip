import { expect } from "chai";
import { EngineMode } from "@paperclip-ui/core";
import { LoadedPCData } from "@paperclip-ui/utils";
import { FramesRenderer } from "../frame-renderer";
import { createMockFramesRenderer, createMockEngineDelegate } from "./utils";

describe(__filename + "#", () => {
  it("Can render basic text", async () => {
    const graph = {
      "/entry.pc": "Hello World"
    };

    const engine = await createMockEngineDelegate(graph, EngineMode.MultiFrame);
    const renderer = createMockFramesRenderer("/entry.pc");
    engine.onEvent(renderer.handleEngineDelegateEvent);
    await engine.open("/entry.pc");
    expect(combineFrameHTML(renderer)).to.eql(
      "<div></div><div><style></style></div><div>Hello World</div>"
    );
  });

  it("Can render an element", async () => {
    const graph = {
      "/entry.pc": "<a href='#'>abc</a>"
    };

    const engine = await createMockEngineDelegate(graph, EngineMode.MultiFrame);
    const renderer = createMockFramesRenderer("/entry.pc");
    engine.onEvent(renderer.handleEngineDelegateEvent);
    await engine.open("/entry.pc");
    expect(combineFrameHTML(renderer)).to.eql(
      `<div></div><div><style></style></div><div><a class="_80f4925f _pub-80f4925f" href="#">abc</a></div>`
    );
  });

  it("Re-renders a basic text change", async () => {
    const graph = {
      "/entry.pc": "a"
    };

    const engine = await createMockEngineDelegate(graph, EngineMode.MultiFrame);
    const renderer = createMockFramesRenderer("/entry.pc");
    engine.onEvent(renderer.handleEngineDelegateEvent);
    await engine.open("/entry.pc");
    expect(combineFrameHTML(renderer)).to.eql(
      `<div></div><div><style></style></div><div>a</div>`
    );
    await engine.updateVirtualFileContent("/entry.pc", "b");
    expect(combineFrameHTML(renderer)).to.eql(
      `<div></div><div><style></style></div><div>b</div>`
    );
  });

  it("Re-renders a basic attribute change", async () => {
    const graph = {
      "/entry.pc": `<span><div a="b"></div></span>`
    };

    const engine = await createMockEngineDelegate(graph, EngineMode.MultiFrame);
    const renderer = createMockFramesRenderer("/entry.pc");
    engine.onEvent(renderer.handleEngineDelegateEvent);
    await engine.open("/entry.pc");
    expect(combineFrameHTML(renderer)).to.eql(
      `<div></div><div><style></style></div><div><span class="_80f4925f _pub-80f4925f"><div a="b" class="_80f4925f _pub-80f4925f"></div></span></div>`
    );
    await engine.updateVirtualFileContent(
      "/entry.pc",
      `<span><div a="c"></div></span>`
    );
    expect(combineFrameHTML(renderer)).to.eql(
      `<div></div><div><style></style></div><div><span class="_80f4925f _pub-80f4925f"><div a="c" class="_80f4925f _pub-80f4925f"></div></span></div>`
    );
  });

  it("Renders a basic style", async () => {
    const graph = {
      "/entry.pc": `<style> a { color: blue; } </style><span></span>`
    };

    const engine = await createMockEngineDelegate(graph, EngineMode.MultiFrame);
    const renderer = createMockFramesRenderer("/entry.pc");
    engine.onEvent(renderer.handleEngineDelegateEvent);
    await engine.open("/entry.pc");
    expect(combineFrameHTML(renderer)).to.eql(
      `<div></div><div><style>a._80f4925f {color: blue;} </style></div><div><span class="_80f4925f _pub-80f4925f"></span></div>`
    );
  });

  it("Renders imported styles", async () => {
    const graph = {
      "/entry.pc": `<import src="./module.pc" /><style> a { color: blue; } </style><span></span>`,
      "/module.pc": `<style> a { color: black; } </style>`
    };

    const engine = await createMockEngineDelegate(graph, EngineMode.MultiFrame);
    const renderer = createMockFramesRenderer("/entry.pc");
    engine.onEvent(renderer.handleEngineDelegateEvent);
    await engine.open("/entry.pc");
    expect(combineFrameHTML(renderer)).to.eql(
      `<div><style>a._139cec8e {color: black;} </style></div><div><style>a._80f4925f {color: blue;} </style></div><div><span class="_80f4925f _pub-80f4925f"></span></div>`
    );
  });

  it("Removes styles if import is removed", async () => {
    const graph = {
      "/entry.pc": `<import src="./module.pc" /><style> a { color: blue; } </style><span></span>`,
      "/module.pc": `<style> a { color: black; } </style>`
    };

    const engine = await createMockEngineDelegate(graph, EngineMode.MultiFrame);
    const renderer = createMockFramesRenderer("/entry.pc");
    engine.onEvent(renderer.handleEngineDelegateEvent);
    await engine.open("/entry.pc");
    expect(combineFrameHTML(renderer)).to.eql(
      `<div><style>a._139cec8e {color: black;} </style></div><div><style>a._80f4925f {color: blue;} </style></div><div><span class="_80f4925f _pub-80f4925f"></span></div>`
    );

    await engine.updateVirtualFileContent(
      "/entry.pc",
      `<style> a { color: blue; } </style><span></span>`
    );
    expect(combineFrameHTML(renderer)).to.eql(
      `<div></div><div><style>a._80f4925f {color: blue;} </style></div><div><span class="_80f4925f _pub-80f4925f"></span></div>`
    );
  });

  it("Adds styles if import is added", async () => {
    const graph = {
      "file:///entry.pc": `<style> a { color: blue; } </style><span></span>`,
      "file:///module.pc": `<style> a { color: black; } </style>`
    };

    const engine = await createMockEngineDelegate(graph, EngineMode.MultiFrame);
    const renderer = createMockFramesRenderer("file:///entry.pc");
    engine.onEvent(renderer.handleEngineDelegateEvent);
    await engine.open("file:///entry.pc");
    expect(combineFrameHTML(renderer)).to.eql(
      `<div></div><div><style>a._80f4925f {color: blue;} </style></div><div><span class="_80f4925f _pub-80f4925f"></span></div>`
    );
    await engine.updateVirtualFileContent(
      "file:///entry.pc",
      `<import src="./module.pc" /><style> a { color: blue; } </style><span></span>`
    );
    expect(combineFrameHTML(renderer)).to.eql(
      `<div><style>a._139cec8e {color: black;} </style></div><div><style>a._80f4925f {color: blue;} </style></div><div><span class="_80f4925f _pub-80f4925f"></span></div>`
    );
  });
  it("Adds styles if import is added of module that is already loaded", async () => {
    const graph = {
      "/entry.pc": `<style> a { color: blue; } </style><span></span>`,
      "/module.pc": `<style> a { color: black; } </style>`
    };

    const engine = await createMockEngineDelegate(graph, EngineMode.MultiFrame);
    const renderer = createMockFramesRenderer("/entry.pc");
    engine.onEvent(renderer.handleEngineDelegateEvent);
    await engine.open("/entry.pc");
    await engine.open("/module.pc");
    expect(combineFrameHTML(renderer)).to.eql(
      `<div></div><div><style>a._80f4925f {color: blue;} </style></div><div><span class="_80f4925f _pub-80f4925f"></span></div>`
    );
    await engine.updateVirtualFileContent(
      "/entry.pc",
      `<import src="./module.pc" /><style> a { color: blue; } </style><span></span>`
    );
    expect(combineFrameHTML(renderer)).to.eql(
      `<div><style>a._139cec8e {color: black;} </style></div><div><style>a._80f4925f {color: blue;} </style></div><div><span class="_80f4925f _pub-80f4925f"></span></div>`
    );
  });
  it("Adds styles from dependency dependency", async () => {
    const graph = {
      "/entry.pc": `<style> a { color: blue; } </style>a`,
      "/module.pc": `<style> a { color: black; } </style>`,
      "/module2.pc": `<style> a { color: orange; } </style>`
    };

    const engine = await createMockEngineDelegate(graph, EngineMode.MultiFrame);
    const renderer = createMockFramesRenderer("/entry.pc");
    engine.onEvent(renderer.handleEngineDelegateEvent);
    await engine.open("/entry.pc");
    await engine.open("/module.pc");
    expect(combineFrameHTML(renderer)).to.eql(
      `<div></div><div><style>a._80f4925f {color: blue;} </style></div><div>a</div>`
    );
    await engine.updateVirtualFileContent(
      "/entry.pc",
      `<import src="./module.pc" /><style> a { color: blue; } </style><span></span>`
    );
    await engine.updateVirtualFileContent(
      "/module.pc",
      `<import src="./module2.pc" /><style> a { color: black; } </style>`
    );
    expect(combineFrameHTML(renderer)).to.eql(
      `<div><style>a._11a847ab {color: orange;} </style><style>a._139cec8e {color: black;} </style></div><div><style>a._80f4925f {color: blue;} </style></div><div><span class="_80f4925f _pub-80f4925f"></span></div>`
    );
  });

  it("styles that are _added_ before renderer initializes are rendered", async () => {
    const graph = {
      "/entry.pc": `<style> a { color: blue; } </style>`,
      "/module.pc": `<style> a { color: black; } </style>`
    };

    const engine = await createMockEngineDelegate(graph, EngineMode.MultiFrame);
    // const renderer = createMockFramesRenderer("/entry.pc");
    // engine.onEvent(renderer.handleEngineDelegateEvent);
    await engine.open("/entry.pc");
    await engine.updateVirtualFileContent(
      "/entry.pc",
      `<import src="./module.pc" /><style> a { color: blue; } </style><span></span>`
    );

    const renderer = createMockFramesRenderer("/entry.pc");
    renderer.initialize((await engine.open("/entry.pc")) as LoadedPCData);

    expect(combineFrameHTML(renderer)).to.eql(
      `<div><style>a._139cec8e {color: black;} </style></div><div><style>a._80f4925f {color: blue;} </style></div><div><span class="_80f4925f _pub-80f4925f"></span></div>`
    );
  });

  it("styles that are _removed_ before renderer initializes are rendered", async () => {
    const graph = {
      "/entry.pc": `<import src="./module.pc" /><style> a { color: blue; } </style><span></span><style> a { color: blue; } </style>`,
      "/module.pc": `<style> a { color: black; } </style>`
    };

    const engine = await createMockEngineDelegate(graph, EngineMode.MultiFrame);
    // const renderer = createMockFramesRenderer("/entry.pc");
    // engine.onEvent(renderer.handleEngineDelegateEvent);
    await engine.open("/entry.pc");

    await engine.updateVirtualFileContent(
      "/entry.pc",
      `<style> a { color: blue; } </style><span></span>`
    );

    const renderer = createMockFramesRenderer("/entry.pc");
    renderer.initialize((await engine.open("/entry.pc")) as LoadedPCData);

    expect(combineFrameHTML(renderer)).to.eql(
      `<div></div><div><style>a._80f4925f {color: blue;} </style></div><div><span class="_80f4925f _pub-80f4925f"></span></div>`
    );
  });

  it("removes styles", async () => {
    const graph = {
      "/entry.pc": `
        <import src="./module-a.pc" />
        <import src="./module-b.pc" />
        <import src="./module-c.pc" />
        <import src="./module-d.pc" />
        a
      `,
      "/module-a.pc": `<style> a { color: a; } </style>`,
      "/module-b.pc": `<style> a { color: b; } </style>`,
      "/module-c.pc": `<style> a { color: c; } </style>`,
      "/module-d.pc": `<style> a { color: d; } </style>`
    };

    const engine = await createMockEngineDelegate(graph, EngineMode.MultiFrame);
    await engine.open("/entry.pc");

    const renderer = createMockFramesRenderer("/entry.pc");
    renderer.initialize((await engine.open("/entry.pc")) as LoadedPCData);
    engine.onEvent(renderer.handleEngineDelegateEvent);

    expect(combineFrameHTML(renderer).replace(/\n/g, "")).to.eql(
      `<div><style>a._61a60758 {color: a;} </style><style>a._7313a8b6 {color: b;} </style><style>a._cbafcfd3 {color: c;} </style><style>a._5678f76a {color: d;} </style></div><div><style></style></div><div> a </div>`
    );

    await engine.updateVirtualFileContent(
      "/entry.pc",
      `
     <import src="./module-b.pc" />
     <import src="./module-d.pc" />a
     `
    );

    expect(combineFrameHTML(renderer).replace(/\n/g, "")).to.eql(
      `<div><style>a._7313a8b6 {color: b;} </style><style>a._5678f76a {color: d;} </style></div><div><style></style></div><div>a </div>`
    );
  });

  it(`Properly replaces elements`, async () => {
    const graph = {
      "/entry.pc": `
      <div export component as="StyledHeader" 
        class="StyledHeader"
        {onClick?}
        > 
      </div>
      
      <div export component as="Preview">
        <StyledHeader {depth?} {open?}>
        </StyledHeader>
      </div>
      
      <preview noPadding>
        <Preview>
        </Preview>
      
        <StyledHeader open>
          Content
        </StyledHeader>
      </preview>`
    };

    const engine = await createMockEngineDelegate(graph, EngineMode.MultiFrame);
    const renderer = createMockFramesRenderer("/entry.pc");
    renderer.initialize((await engine.open("/entry.pc")) as LoadedPCData);
    engine.onEvent(renderer.handleEngineDelegateEvent);

    await engine.updateVirtualFileContent(
      "file:///entry.pc",
      `

  <div export component as="StyledHeader" 
    class="StyledHeader"
    {onClick?}
    > 
  </div>

  <div export component as="Preview">
    <StyledHeader {depth?} {open?}>
    </StyledHeader>
  </div>

  <preview noPadding>
    <Preview header="Header">
    </Preview>

    <Preview header="Header">
      Content
    </Preview>
  </preview>
    `
    );

    const renderer2 = createMockFramesRenderer("/entry.pc");
    renderer2.initialize((await engine.open("/entry.pc")) as LoadedPCData);
    engine.onEvent(renderer.handleEngineDelegateEvent);

    expect(combineFrameHTML(renderer)).not.to.eql(undefined);

    expect(combineFrameHTML(renderer)).to.eql(combineFrameHTML(renderer2));
  });

  it(`Properly renders with a protocol`, async () => {
    const graph = {
      "file:///entry.pc": `
        <img src="/file.jpg" />
      `,
      "file:///file.jpg": `a`,
      "file:///something-else.jpg": `a`
    };

    const engine = await createMockEngineDelegate(graph, EngineMode.MultiFrame);
    const renderer = createMockFramesRenderer(
      "file:///entry.pc",
      (url: string) => url.replace("file:", "blah:")
    );
    renderer.initialize(
      (await engine.open("file:///entry.pc")) as LoadedPCData
    );
    engine.onEvent(renderer.handleEngineDelegateEvent);

    expect(
      combineFrameHTML(renderer)
        .replace("\n", "")
        .replace(/\\+/g, "/")
    ).to.eql(
      `<div></div><div><style></style></div><div><img class="_80f4925f _pub-80f4925f" src="blah:///file.jpg"></img></div>`
    );

    engine.updateVirtualFileContent(
      "file:///entry.pc",
      `
      <img src="./something-else.jpg" />
    `
    );

    expect(
      combineFrameHTML(renderer)
        .replace("\n", "")
        .replace(/\\/g, "/Z/")
    ).to.eql(
      `<div></div><div><style></style></div><div><img class="_80f4925f _pub-80f4925f" src="blah:///something-else.jpg"></img></div>`
    );
  });

  it(`Treats doesn't remove previous class if class is set`, async () => {
    const graph = {
      "file:///entry.pc": `
        
        <span class="a">
        </span>
      `
    };

    const engine = await createMockEngineDelegate(graph, EngineMode.MultiFrame);
    const renderer = createMockFramesRenderer("file:///entry.pc", url =>
      url.replace("file", "blah")
    );
    renderer.initialize(
      (await engine.open("file:///entry.pc")) as LoadedPCData
    );
    engine.onEvent(renderer.handleEngineDelegateEvent);

    expect(
      combineFrameHTML(renderer)
        .replace("\n", "")
        .replace(/\\+/g, "/")
    ).to.eql(
      `<div></div><div><style></style></div><div><span class="_80f4925f_a _pub-80f4925f_a a _80f4925f _pub-80f4925f"></span></div>`
    );

    engine.updateVirtualFileContent(
      "file:///entry.pc",
      `<span class="a" class>
      </span>
    `
    );

    expect(
      combineFrameHTML(renderer)
        .replace("\n", "")
        .replace(/\\/g, "/Z/")
    ).to.eql(
      `<div></div><div><style></style></div><div><span class="true _80f4925f _pub-80f4925f"></span></div>`
    );

    engine.updateVirtualFileContent(
      "file:///entry.pc",
      `<span class:a="a" class="b">
      </span>
    `
    );

    expect(
      combineFrameHTML(renderer)
        .replace("\n", "")
        .replace(/\\/g, "/Z/")
    ).to.eql(
      `<div></div><div><style></style></div><div><span class="_80f4925f_b _pub-80f4925f_b b _80f4925f _pub-80f4925f"></span></div>`
    );
  });

  it(`Properly replaces rule`, async () => {
    const graph = {
      "file:///entry.pc": `
        <style>
          .a {
            color: red;
          }
          .b {
            color: orange;
            @media screen and (max-width: 100px) {
              color: blue;
            }
          }
          @keyframes {
            0% {
              color: blue;
            }
            100% {
              color: black;
            }
          }
        </style>
        <div></div>
      `
    };

    const engine = await createMockEngineDelegate(graph, EngineMode.MultiFrame);
    const renderer = createMockFramesRenderer("file:///entry.pc");

    renderer.initialize(
      (await engine.open("file:///entry.pc")) as LoadedPCData
    );
    engine.onEvent(renderer.handleEngineDelegateEvent);

    expect(
      combineFrameHTML(renderer)
        .replace("\n", "")
        .replace(/\\+/g, "/")
    ).to.eql(
      `<div></div><div><style>[class]._80f4925f_a {color: red;} [class]._80f4925f_b {color: orange;} @media screen and (max-width: 100px) {[class]._80f4925f_b {color: blue;}} @keyframes _80f4925f_ {    0% {color: blue;}    100% {color: black;}  } </style></div><div><div class="_80f4925f _pub-80f4925f"></div></div>`
    );

    engine.updateVirtualFileContent(
      "file:///entry.pc",
      `<style>
      .d {
        color: orange;
      }
  </style>
  <div></div>`
    );

    expect(
      combineFrameHTML(renderer)
        .replace("\n", "")
        .replace(/\\+/g, "/")
    ).to.eql(
      `<div></div><div><style>[class]._80f4925f_d {color: orange;} </style></div><div><div class="_80f4925f _pub-80f4925f"></div></div>`
    );
  });

  it(`Properly inserts rule`, async () => {
    const graph = {
      "file:///entry.pc": `
        <style>
          .a {
            color: red;
          }
        </style>
        <div></div>
      `
    };

    const engine = await createMockEngineDelegate(graph, EngineMode.MultiFrame);
    const renderer = createMockFramesRenderer("file:///entry.pc");

    renderer.initialize(
      (await engine.open("file:///entry.pc")) as LoadedPCData
    );
    engine.onEvent(renderer.handleEngineDelegateEvent);

    expect(
      combineFrameHTML(renderer)
        .replace("\n", "")
        .replace(/\\+/g, "/")
    ).to.eql(
      `<div></div><div><style>[class]._80f4925f_a {color: red;} </style></div><div><div class="_80f4925f _pub-80f4925f"></div></div>`
    );

    engine.updateVirtualFileContent(
      "file:///entry.pc",
      `<style>
      .a {
        color: red;
      }
      .b {
        color: blue;
      }
  </style>
  <div></div>`
    );

    expect(
      combineFrameHTML(renderer)
        .replace("\n", "")
        .replace(/\\+/g, "/")
    ).to.eql(
      `<div></div><div><style>[class]._80f4925f_a {color: red;} [class]._80f4925f_b {color: blue;} </style></div><div><div class="_80f4925f _pub-80f4925f"></div></div>`
    );
  });

  it(`Ignores frames from unrelated files`, async () => {
    const graph = {
      "file:///main.pc": `
        <import src="./test.pc" as="test" />

        <style>
          @font-face {
            font-family: "Eina";
            src: url('./Eina03-Regular.woff');
          }
        </style>
        
        
        <!--
          @frame { width: 365, height: 194, x: 0, y: 0 }
        -->
        <div>
          <style>
            font-family: Eina;
          </style>
          Hello dawggg
          <test.Test>
            Hello world
          </test.Test>
        </div>
      `,
      "file:///test.pc": `
      <!--
        @frame { visible: false }
      -->
      <div export component as="Test">
        <style>
          font-family: sans-serif;
          color: rgb(100, 172, 86);
          font-size: 24px;
        </style>
        {children}
      </div>
      
      
      <!--
        @frame { width: 346, height: 203, x: 0, y: 0 }
      -->
      <Test>
        Hello world
      </Test>
      `,
      "file:///Eina03-Regular.woff": `a`
    };

    const engine = await createMockEngineDelegate(graph, EngineMode.MultiFrame);
    const renderer = createMockFramesRenderer("file:///test.pc");

    renderer.initialize((await engine.open("file:///test.pc")) as LoadedPCData);
    await engine.open("file:///main.pc");

    engine.onEvent(renderer.handleEngineDelegateEvent);

    await engine.updateVirtualFileContent("file:///main.pc", ``);

    expect(
      combineFrameHTML(renderer)
        .replace("\n", "")
        .replace(/\\+/g, "/")
    ).to.eql(
      `<div></div><div><style>._a0539270._a0539270 {font-family: sans-serif; color: rgb(100, 172, 86); font-size: 24px;} </style></div><div><div class="_6bcf0994 _pub-6bcf0994 _a0539270"> Hello world </div></div>`
    );
  });

  it(`Renders slots`, async () => {
    const graph = {
      "file:///entry.pc": `
        <div component as="Test">
          {children}
        </div>
      `
    };

    const engine = await createMockEngineDelegate(graph, EngineMode.MultiFrame);
    const renderer = createMockFramesRenderer("file:///entry.pc");

    renderer.initialize(
      (await engine.open("file:///entry.pc")) as LoadedPCData
    );
    engine.onEvent(renderer.handleEngineDelegateEvent);

    expect(
      combineFrameHTML(renderer)
        .replace("\n", "")
        .replace(/\\+/g, "/")
    ).to.eql(
      `<div></div><div><style></style></div><div><div class="_80f4925f _pub-80f4925f"><div style="border: 1px dashed #333; padding: 30px; box-sizing: border-box;"></div></div></div>`
    );
  });
});

const combineFrameHTML = (renderer: FramesRenderer) => {
  return renderer
    .getState()
    .frames.map(frame => frame.stage.innerHTML)
    .join("");
};
