import { PCDocument } from "../client/documents";
import { createMockHost } from "./utils";
import { expect } from "chai";
import { combineFrameHTML } from "@paperclip-ui/web-renderer/lib/test/utils";

describe(__filename + "#", () => {
  it(`Can render basic HTML`, async () => {
    const { server } = createMockHost({
      "/entry.pc": "Hello"
    });

    const client = server.createHostClient();
    const doc = (await client.open("/entry.pc")) as PCDocument;
    const rendererState = doc.getRenderer().getState();
    expect(combineFrameHTML(rendererState)).to.eql(
      `<div></div><div><style></style></div><div>Hello</div>`
    );
  });

  it(`Re-renders based on document changes`, async () => {
    const { server } = createMockHost({
      "/entry.pc": "Hello"
    });

    const client = server.createHostClient();
    const doc = (await client.open("/entry.pc")) as PCDocument;

    const source = await doc.getSource();
    source.insertText("blah".split(""));
    const rendererState = doc.getRenderer().getState();
    expect(combineFrameHTML(rendererState)).to.eql(
      `<div></div><div><style></style></div><div>blahHello</div>`
    );
  });
});
