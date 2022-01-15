import { stringifyVirtualNode, VirtualText } from "@paperclip-ui/core";
import { expect } from "chai";
import { VirtualobjectEditKind } from "../core";
import { createMockHost } from "./utils";

// TODO - test latency

describe(__filename + "#", () => {
  it(`Can update the text of a virtual node`, async () => {
    const { server } = createMockHost({
      "/hello.pc": "<div>blah</div>"
    });

    const client = server.createHostClient();

    const doc = await client.open("/hello.pc");
    doc.editVirtualObjects([
      {
        kind: VirtualobjectEditKind.InsertNodeBefore,
        beforeNodeId: "0.0",
        node: "<span />"
      }
    ]);
    expect(stringifyVirtualNode(doc.getContent().virtualData.preview)).to.eql(
      `<div class="_5cd17222 _pub-5cd17222"><span class="_5cd17222 _pub-5cd17222"></span>blah</div>`
    );
  });
  it(`Can update the text `, async () => {
    const { server } = createMockHost({
      "/hello.pc": "<div>blah</div>"
    });

    const client = server.createHostClient();

    const doc = await client.open("/hello.pc");
    doc.editVirtualObjects([
      {
        kind: VirtualobjectEditKind.InsertNodeBefore,
        beforeNodeId: "0.0",
        node: "<span />"
      }
    ]);
    expect(stringifyVirtualNode(doc.getContent().virtualData.preview)).to.eql(
      `<div class="_5cd17222 _pub-5cd17222"><span class="_5cd17222 _pub-5cd17222"></span>blah</div>`
    );
  });
});
