import { expect } from "chai";
import * as Automerge from "automerge";
import { createMockEngine } from "@paperclip-ui/core/lib/test/utils";
import { EditorHost } from "../host/host";
import { createMockServer } from "./utils";
import { EditorClient } from "../client/client";
import { PCDocument } from "../client/documents";
import { stringifyVirtualNode } from "@paperclip-ui/core";

describe(__filename + "#", () => {
  it(`Can open a simple document`, async () => {
    const server = createMockServer();

    const host = new EditorHost(
      createMockEngine({
        "/hello.pc": "div"
      }),
      server
    );

    host.start();

    const client = new EditorClient(server.createClient());

    const doc = await client.open("/hello.pc");

    expect((await doc.getSource()).getText()).to.eql("div");
  });

  it(`Text changes are synchronized between documents`, async () => {
    const server = createMockServer();

    const host = new EditorHost(
      createMockEngine({
        "/hello.pc": "div"
      }),
      server
    );

    host.start();

    const client = new EditorClient(server.createClient());
    const doc = await client.open("/hello.pc");
    const docSource = await doc.getSource();
    expect(docSource.getText()).to.eql("div");

    const client2 = new EditorClient(server.createClient());
    const doc2 = await client2.open("/hello.pc");
    const doc2Source = await doc2.getSource();

    docSource.insertText("blahh".split(""));

    expect(await doc2Source.getText()).to.eql("blahhdiv");
  });

  it(`The engine updates when the source doc changes`, async () => {
    const server = createMockServer();
    const host = new EditorHost(
      createMockEngine({
        "/hello.pc": "Hello World"
      }),
      server
    );
    host.start();

    const client = new EditorClient(server.createClient());
    const doc = (await client.open("/hello.pc")) as PCDocument;
    expect(stringifyVirtualNode(doc.getContent().virtualData.preview)).to.eql(
      "Hello World"
    );

    const source = await doc.getSource();
    source.insertText("abc".split(""));

    expect(stringifyVirtualNode(doc.getContent().virtualData.preview)).to.eql(
      "abcHello World"
    );
  });
});
