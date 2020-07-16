import { expect } from "chai";
import { createMockEngine, createMockRenderer } from "./utils";

describe(__filename + "#", () => {
  it("Can render basic text", async () => {
    const graph = {
      "/entry.pc": "Hello World"
    };

    const engine = createMockEngine(graph);
    const renderer = createMockRenderer("/entry.pc");
    engine.onEvent(renderer.handleEngineEvent);
    await engine.run("/entry.pc");
    expect(renderer.mount.innerHTML).to.eql(
      "<div></div><div><style></style></div><div>Hello World</div><div></div><div></div>"
    );
  });

  it("Can render an element", async () => {
    const graph = {
      "/entry.pc": "<a href='#'>abc</a>"
    };

    const engine = createMockEngine(graph);
    const renderer = createMockRenderer("/entry.pc");
    engine.onEvent(renderer.handleEngineEvent);
    await engine.run("/entry.pc");
    expect(renderer.mount.innerHTML).to.eql(
      `<div></div><div><style></style></div><div><a href="#">abc</a></div><div></div><div></div>`
    );
  });

  it("Re-renders a basic text change", async () => {
    const graph = {
      "/entry.pc": "a"
    };

    const engine = createMockEngine(graph);
    const renderer = createMockRenderer("/entry.pc");
    engine.onEvent(renderer.handleEngineEvent);
    await engine.run("/entry.pc");
    expect(renderer.mount.innerHTML).to.eql(
      `<div></div><div><style></style></div><div>a</div><div></div><div></div>`
    );
    await engine.updateVirtualFileContent("/entry.pc", "b");
    expect(renderer.mount.innerHTML).to.eql(
      `<div></div><div><style></style></div><div>b</div><div></div><div></div>`
    );
  });

  it("Re-renders a basic attribute change", async () => {
    const graph = {
      "/entry.pc": `<span><div a="b"></div></span>`
    };

    const engine = createMockEngine(graph);
    const renderer = createMockRenderer("/entry.pc");
    engine.onEvent(renderer.handleEngineEvent);
    await engine.run("/entry.pc");
    expect(renderer.mount.innerHTML).to.eql(
      `<div></div><div><style></style></div><div><span><div a="b"></div></span></div><div></div><div></div>`
    );
    await engine.updateVirtualFileContent(
      "/entry.pc",
      `<span><div a="c"></div></span>`
    );
    expect(renderer.mount.innerHTML).to.eql(
      `<div></div><div><style></style></div><div><span><div a="c"></div></span></div><div></div><div></div>`
    );
  });

  it("Renders a basic style", async () => {
    const graph = {
      "/entry.pc": `<style> a { color: blue; } </style><span></span>`
    };

    const engine = createMockEngine(graph);
    const renderer = createMockRenderer("/entry.pc");
    engine.onEvent(renderer.handleEngineEvent);
    await engine.run("/entry.pc");
    expect(renderer.mount.innerHTML).to.eql(
      `<div></div><div><style>a[data-pc-80f4925f] { color:blue; }</style></div><div><span></span></div><div></div><div></div>`
    );
  });

  it("Renders imported styles", async () => {
    const graph = {
      "/entry.pc": `<import src="./module.pc"><style> a { color: blue; } </style><span></span>`,
      "/module.pc": `<style> a { color: black; } </style>`
    };

    const engine = createMockEngine(graph);
    const renderer = createMockRenderer("/entry.pc");
    engine.onEvent(renderer.handleEngineEvent);
    await engine.run("/entry.pc");
    expect(renderer.mount.innerHTML).to.eql(
      `<div><style>a[data-pc-139cec8e] { color:black; }</style></div><div><style>a[data-pc-80f4925f] { color:blue; }</style></div><div><span></span></div><div></div><div></div>`
    );
  });

  it("Removes styles if import is removed", async () => {
    const graph = {
      "/entry.pc": `<import src="./module.pc"><style> a { color: blue; } </style><span></span>`,
      "/module.pc": `<style> a { color: black; } </style>`
    };

    const engine = createMockEngine(graph);
    const renderer = createMockRenderer("/entry.pc");
    engine.onEvent(renderer.handleEngineEvent);
    await engine.run("/entry.pc");
    expect(renderer.mount.innerHTML).to.eql(
      `<div><style>a[data-pc-139cec8e] { color:black; }</style></div><div><style>a[data-pc-80f4925f] { color:blue; }</style></div><div><span></span></div><div></div><div></div>`
    );
    await engine.updateVirtualFileContent(
      "/entry.pc",
      `<style> a { color: blue; } </style><span></span>`
    );
    expect(renderer.mount.innerHTML).to.eql(
      `<div></div><div><style>a[data-pc-80f4925f] { color:blue; }</style></div><div><span></span></div><div></div><div></div>`
    );
  });

  it("Adds styles if import is added", async () => {
    const graph = {
      "file:///entry.pc": `<style> a { color: blue; } </style><span></span>`,
      "file:///module.pc": `<style> a { color: black; } </style>`
    };

    const engine = createMockEngine(graph);
    const renderer = createMockRenderer("file:///entry.pc");
    engine.onEvent(renderer.handleEngineEvent);
    await engine.run("file:///entry.pc");
    expect(renderer.mount.innerHTML).to.eql(
      `<div></div><div><style>a[data-pc-80f4925f] { color:blue; }</style></div><div><span></span></div><div></div><div></div>`
    );
    await engine.updateVirtualFileContent(
      "file:///entry.pc",
      `<import src="./module.pc"><style> a { color: blue; } </style><span></span>`
    );
    expect(renderer.mount.innerHTML).to.eql(
      `<div><style>a[data-pc-139cec8e] { color:black; }</style></div><div><style>a[data-pc-80f4925f] { color:blue; }</style></div><div><span></span></div><div></div><div></div>`
    );
  });
  it("Adds styles if import is added of module that is already loaded", async () => {
    const graph = {
      "/entry.pc": `<style> a { color: blue; } </style><span></span>`,
      "/module.pc": `<style> a { color: black; } </style>`
    };

    const engine = createMockEngine(graph);
    const renderer = createMockRenderer("/entry.pc");
    engine.onEvent(renderer.handleEngineEvent);
    await engine.run("/entry.pc");
    await engine.run("/module.pc");
    expect(renderer.mount.innerHTML).to.eql(
      `<div></div><div><style>a[data-pc-80f4925f] { color:blue; }</style></div><div><span></span></div><div></div><div></div>`
    );
    await engine.updateVirtualFileContent(
      "/entry.pc",
      `<import src="./module.pc"><style> a { color: blue; } </style><span></span>`
    );
    expect(renderer.mount.innerHTML).to.eql(
      `<div><style>a[data-pc-139cec8e] { color:black; }</style></div><div><style>a[data-pc-80f4925f] { color:blue; }</style></div><div><span></span></div><div></div><div></div>`
    );
  });
  it("Adds styles from dependency dependency", async () => {
    const graph = {
      "/entry.pc": `<style> a { color: blue; } </style>`,
      "/module.pc": `<style> a { color: black; } </style>`,
      "/module2.pc": `<style> a { color: orange; } </style>`
    };

    const engine = createMockEngine(graph);
    const renderer = createMockRenderer("/entry.pc");
    engine.onEvent(renderer.handleEngineEvent);
    await engine.run("/entry.pc");
    await engine.run("/module.pc");
    expect(renderer.mount.innerHTML).to.eql(
      `<div></div><div><style>a[data-pc-80f4925f] { color:blue; }</style></div><div></div><div></div><div></div>`
    );
    await engine.updateVirtualFileContent(
      "/entry.pc",
      `<import src="./module.pc"><style> a { color: blue; } </style><span></span>`
    );
    await engine.updateVirtualFileContent(
      "/module.pc",
      `<import src="./module2.pc"><style> a { color: black; } </style>`
    );
    expect(renderer.mount.innerHTML).to.eql(
      `<div><style>a[data-pc-139cec8e] { color:black; }</style><style>a[data-pc-11a847ab] { color:orange; }</style></div><div><style>a[data-pc-80f4925f] { color:blue; }</style></div><div><span></span></div><div></div><div></div>`
    );
  });

  it("styles that are _added_ before renderer initializes are rendered", async () => {
    const graph = {
      "/entry.pc": `<style> a { color: blue; } </style>`,
      "/module.pc": `<style> a { color: black; } </style>`
    };

    const engine = createMockEngine(graph);
    // const renderer = createMockRenderer("/entry.pc");
    // engine.onEvent(renderer.handleEngineEvent);
    await engine.run("/entry.pc");
    await engine.updateVirtualFileContent(
      "/entry.pc",
      `<import src="./module.pc"><style> a { color: blue; } </style><span></span>`
    );

    const renderer = createMockRenderer("/entry.pc");
    renderer.initialize(await engine.run("/entry.pc"));

    expect(renderer.mount.innerHTML).to.eql(
      `<div><style>a[data-pc-139cec8e] { color:black; }</style></div><div><style>a[data-pc-80f4925f] { color:blue; }</style></div><div><span></span></div><div></div><div></div>`
    );
  });

  it("styles that are _removed_ before renderer initializes are rendered", async () => {
    const graph = {
      "/entry.pc": `<import src="./module.pc"><style> a { color: blue; } </style><span></span><style> a { color: blue; } </style>`,
      "/module.pc": `<style> a { color: black; } </style>`
    };

    const engine = createMockEngine(graph);
    // const renderer = createMockRenderer("/entry.pc");
    // engine.onEvent(renderer.handleEngineEvent);
    await engine.run("/entry.pc");

    await engine.updateVirtualFileContent(
      "/entry.pc",
      `<style> a { color: blue; } </style><span></span>`
    );

    const renderer = createMockRenderer("/entry.pc");
    renderer.initialize(await engine.run("/entry.pc"));

    expect(renderer.mount.innerHTML).to.eql(
      `<div></div><div><style>a[data-pc-80f4925f] { color:blue; }</style></div><div><span></span></div><div></div><div></div>`
    );
  });

  it("removes styles", async () => {
    const graph = {
      "/entry.pc": `
        <import src="./module-a.pc">
        <import src="./module-b.pc">
        <import src="./module-c.pc">
        <import src="./module-d.pc">
      `,
      "/module-a.pc": `<style> a { color: a; } </style>`,
      "/module-b.pc": `<style> a { color: b; } </style>`,
      "/module-c.pc": `<style> a { color: c; } </style>`,
      "/module-d.pc": `<style> a { color: d; } </style>`
    };

    const engine = createMockEngine(graph);
    await engine.run("/entry.pc");

    const renderer = createMockRenderer("/entry.pc");
    renderer.initialize(await engine.run("/entry.pc"));
    engine.onEvent(renderer.handleEngineEvent);

    expect(renderer.mount.innerHTML.replace(/\n/g, "")).to.eql(
      `<div><style>a[data-pc-61a60758] { color:a; }</style><style>a[data-pc-7313a8b6] { color:b; }</style><style>a[data-pc-cbafcfd3] { color:c; }</style><style>a[data-pc-5678f76a] { color:d; }</style></div><div><style></style></div><div>      </div><div></div><div></div>`
    );

    await engine.updateVirtualFileContent(
      "/entry.pc",
      `
     <import src="./module-b.pc">
     <import src="./module-d.pc">
     `
    );

    expect(renderer.mount.innerHTML.replace(/\n/g, "")).to.eql(
      `<div><style>a[data-pc-7313a8b6] { color:b; }</style><style>a[data-pc-5678f76a] { color:d; }</style></div><div><style></style></div><div>     </div><div></div><div></div>`
    );
  });

  it(`Properly replaces elements`, async () => {
    const graph = {
      "/entry.pc": `
      <div export component as="StyledHeader" 
        className="StyledHeader"
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

    const engine = createMockEngine(graph);
    const renderer = createMockRenderer("/entry.pc");
    renderer.initialize(await engine.run("/entry.pc"));
    engine.onEvent(renderer.handleEngineEvent);

    await engine.updateVirtualFileContent(
      "file:///entry.pc",
      `

  <div export component as="StyledHeader" 
    className="StyledHeader"
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

    const renderer2 = createMockRenderer("/entry.pc");
    renderer2.initialize(await engine.run("/entry.pc"));
    engine.onEvent(renderer.handleEngineEvent);

    expect(renderer.mount.innerHTML).not.to.eql(undefined);

    expect(renderer.mount.innerHTML).to.eql(renderer2.mount.innerHTML);
  });

  it(`Properly renders with a protocol`, async () => {
    const graph = {
      "file:///entry.pc": `
        <img src="/file.jpg">
      `,
      "file:///file.jpg": ``,
      "file:///something-else.jpg": ``
    };

    const engine = createMockEngine(graph);
    const renderer = createMockRenderer("file:///entry.pc", "blah:");
    renderer.initialize(await engine.run("file:///entry.pc"));
    engine.onEvent(renderer.handleEngineEvent);

    expect(renderer.mount.innerHTML.replace("\n", "")).to.eql(
      `<div></div><div><style></style></div><div><img src="blah:///file.jpg"></img>      </div><div></div><div></div>`
    );

    engine.updateVirtualFileContent(
      "file:///entry.pc",
      `
      <img src="./something-else.jpg">
    `
    );

    expect(renderer.mount.innerHTML.replace("\n", "")).to.eql(
      `<div></div><div><style></style></div><div><img src="blah:///something-else.jpg"></img>    </div><div></div><div></div>`
    );
  });
});
