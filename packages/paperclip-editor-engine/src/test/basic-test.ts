import { expect } from "chai";
import * as Automerge from "automerge";
import { createMockEngine } from "@paperclip-ui/core/lib/test/utils";
import { EditorHost } from "../host/host";
import { createMockHost, createMockServer, timeout } from "./utils";
import { EditorClient } from "../client/client";
import { PCDocument } from "../client/documents";
import { stringifyVirtualNode } from "@paperclip-ui/core";

describe(__filename + "#", () => {
  it(`Can open a simple document`, async () => {
    const { server } = createMockHost({
      "/hello.pc": "div"
    });

    const client = server.createHostClient();

    const doc = await client.open("/hello.pc");

    expect((await doc.getSource()).getText()).to.eql("div");
  });

  it(`Text changes are synchronized between documents`, async () => {
    const { server } = createMockHost({
      "/hello.pc": "div"
    });

    const client = server.createHostClient();
    const doc = await client.open("/hello.pc");
    const docSource = await doc.getSource();
    expect(docSource.getText()).to.eql("div");

    const client2 = server.createHostClient();
    const doc2 = await client2.open("/hello.pc");
    const doc2Source = await doc2.getSource();

    docSource.insertText("blahh".split(""));

    expect(await doc2Source.getText()).to.eql("blahhdiv");
  });

  it(`The engine updates when the source doc changes`, async () => {
    const { server } = createMockHost({
      "/hello.pc": "Hello World"
    });

    const client = server.createHostClient();
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

  it(`Changes from two docs converge into one`, async () => {
    const { server } = createMockHost({
      "/hello.pc": "Hello World"
    });

    const client = server.createHostClient(true);
    const doc1 = (await client.open("/hello.pc")) as PCDocument;
    const src1 = await doc1.getSource();
    src1.insertText("111".split(""));

    const client2 = server.createHostClient(true);
    const doc2 = (await client2.open("/hello.pc")) as PCDocument;
    const src2 = await doc2.getSource();
    src2.insertText("222".split(""));

    await timeout(10);

    expect(stringifyVirtualNode(doc1.getContent().virtualData.preview)).to.eql(
      "222111Hello World"
    );
  });
});
