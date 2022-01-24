import { PCDocument } from "../client/documents";
import { createMockHost } from "./utils";
import { expect } from "chai";
import {
  combineFrameHTML2,
  mockDOMFactory,
} from "@paperclip-ui/web-renderer/lib/test/utils";
import { renderFrames, patchFrames } from "@paperclip-ui/web-renderer";
import { stringifyVirtualNode } from "@paperclip-ui/core";

describe(__filename + "#", () => {
  it(`Can render basic HTML`, async () => {
    const { server } = await createMockHost({
      "/entry.pc": "Hello",
    });

    const client = server.createHostClient();
    const doc = (await client.getDocuments().open("/entry.pc")) as PCDocument;
    expect(
      combineFrameHTML2(
        renderFrames(doc.getContent(), { domFactory: mockDOMFactory })
      )
    ).to.eql(`<div></div><div><style></style></div><div>Hello</div>`);
  });

  it(`Re-renders based on document changes`, async () => {
    const { server } = await createMockHost({
      "/entry.pc": "Hello",
    });

    const client = server.createHostClient();
    const doc = (await client.getDocuments().open("/entry.pc")) as PCDocument;

    const source = await doc.getSource();
    source.setText("blah".split(""));
    expect(
      combineFrameHTML2(
        renderFrames(doc.getContent(), { domFactory: mockDOMFactory })
      )
    ).to.eql(`<div></div><div><style></style></div><div>blahHello</div>`);
  });

  it(`Updates imported CSS when the imported CSS changes`, async () => {
    const { server } = await createMockHost({
      "/entry.pc": `<import src="/imp.pc" /><div />`,
      "/imp.pc": `<style>div { color: red; }</style>`,
    });

    const client = server.createHostClient();
    const doc = (await client.getDocuments().open("/entry.pc")) as PCDocument;
    const doc2 = (await client.getDocuments().open("/imp.pc")) as PCDocument;

    const source = await doc2.getSource();
    source.setText(
      `<style>div { color: blue; }</style>`.split(""),
      0,
      source.getText().length
    );
    expect(
      combineFrameHTML2(
        renderFrames(doc.getContent(), { domFactory: mockDOMFactory })
      )
    ).to.eql(
      `<div><style>div._f7127f1d {color: blue;} </style></div><div><style></style></div><div><div class="_80f4925f _pub-80f4925f"></div></div>`
    );
  });

  it(`Re-orders style sheets if order has changed`, async () => {
    const { server } = await createMockHost({
      "/entry.pc": `<import src="/imp2.pc" /><import src="/imp.pc" /><div />`,
      "/imp.pc": `<style>div { color: red; }</style>`,
      "/imp2.pc": `<style>div { color: orange; }</style>`,
    });

    const client = server.createHostClient();
    const doc = (await client.getDocuments().open("/entry.pc")) as PCDocument;
    expect(
      combineFrameHTML2(
        renderFrames(doc.getContent(), { domFactory: mockDOMFactory })
      )
    ).to.eql(
      `<div><style>div._784a0bc6 {color: orange;} </style><style>div._f7127f1d {color: red;} </style></div><div><style></style></div><div><div class="_80f4925f _pub-80f4925f"></div></div>`
    );

    const source = await doc.getSource();
    source.setText(
      `<import src="/imp.pc" /><import src="/imp2.pc" /><div />`.split(""),
      0,
      source.getText().length
    );

    expect(
      combineFrameHTML2(
        renderFrames(doc.getContent(), { domFactory: mockDOMFactory })
      )
    ).to.eql(
      `<div><style>div._f7127f1d {color: red;} </style><style>div._784a0bc6 {color: orange;} </style></div><div><style></style></div><div><div class="_80f4925f _pub-80f4925f"></div></div>`
    );
  });

  it(`Can remove an import`, async () => {
    const { server } = await createMockHost({
      "/entry.pc": `<import src="/imp2.pc" /><import src="/imp.pc" /><div />`,
      "/imp.pc": `<style>div { color: red; }</style>`,
      "/imp2.pc": `<style>div { color: orange; }</style>`,
    });

    const client = server.createHostClient();
    const doc = (await client.getDocuments().open("/entry.pc")) as PCDocument;
    expect(
      combineFrameHTML2(
        renderFrames(doc.getContent(), { domFactory: mockDOMFactory })
      )
    ).to.eql(
      `<div><style>div._784a0bc6 {color: orange;} </style><style>div._f7127f1d {color: red;} </style></div><div><style></style></div><div><div class="_80f4925f _pub-80f4925f"></div></div>`
    );

    const source = await doc.getSource();
    source.setText(
      `<import src="/imp.pc" /><div />`.split(""),
      0,
      source.getText().length
    );

    expect(
      combineFrameHTML2(
        renderFrames(doc.getContent(), { domFactory: mockDOMFactory })
      )
    ).to.eql(
      `<div><style>div._f7127f1d {color: red;} </style></div><div><style></style></div><div><div class="_80f4925f _pub-80f4925f"></div></div>`
    );
  });

  it(`Can add an import`, async () => {
    const { server } = await createMockHost({
      "/entry.pc": `<import src="/imp.pc" /><div />`,
      "/imp.pc": `<style>div { color: red; }</style>`,
      "/imp2.pc": `<style>div { color: orange; }</style>afdsfdsfds`,
    });

    const client = server.createHostClient();
    const doc = (await client.getDocuments().open("/entry.pc")) as PCDocument;
    expect(
      combineFrameHTML2(
        renderFrames(doc.getContent(), { domFactory: mockDOMFactory })
      )
    ).to.eql(
      `<div><style>div._f7127f1d {color: red;} </style></div><div><style></style></div><div><div class="_80f4925f _pub-80f4925f"></div></div>`
    );

    const source = await doc.getSource();
    source.setText(
      `<import src="/imp.pc" /><import src="/imp2.pc" /><div />`.split(""),
      0,
      source.getText().length
    );

    expect(
      combineFrameHTML2(
        renderFrames(doc.getContent(), { domFactory: mockDOMFactory })
      )
    ).to.eql(
      `<div><style>div._f7127f1d {color: red;} </style><style>div._784a0bc6 {color: orange;} </style></div><div><style></style></div><div><div class="_80f4925f _pub-80f4925f"></div></div>`
    );
  });

  it(`Updates content when local sheet changes`, async () => {
    const { server } = await createMockHost({
      "/entry.pc": `<style>div { color: blue }</style><div />`,
    });

    const client = server.createHostClient();
    const doc = (await client.getDocuments().open("/entry.pc")) as PCDocument;

    const source = await doc.getSource();
    source.setText(
      `<style>div { color: orange; }</style><div />`.split(""),
      0,
      source.getText().length
    );

    expect(
      combineFrameHTML2(
        renderFrames(doc.getContent(), { domFactory: mockDOMFactory })
      )
    ).to.eql(
      `<div></div><div><style>div._80f4925f {color: orange;} </style></div><div><div class="_80f4925f _pub-80f4925f"></div></div>`
    );
  });

  it(`Imported CSS can be updated`, async () => {
    const { server, engine } = await createMockHost({
      "/entry.pc": `<import src="/imp.css" /><div />`,
      "/imp.css": `div { color: blue }`,
    });

    const client = server.createHostClient();
    const doc = (await client.getDocuments().open("/entry.pc")) as PCDocument;
    // const doc2 = (await client.getDocuments().open("/imp.css")) as PCDocument;

    // cheat
    engine.updateVirtualFileContent("/imp.css", `div { color: orange }`);

    // const source = await doc2.getSource();
    // source.setText(
    //   `div { color: orange }`.split(""),
    //   0,
    //   source.getText().length
    // );

    expect(
      combineFrameHTML2(
        renderFrames(doc.getContent(), { domFactory: mockDOMFactory })
      )
    ).to.eql(
      `<div><style>div._pub-2c5dbed5 {color: orange;} </style></div><div><style></style></div><div><div class="_80f4925f _pub-80f4925f"></div></div>`
    );
  });
});
