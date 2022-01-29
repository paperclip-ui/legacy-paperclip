import { expect } from "chai";
import { createMockHost, timeout } from "./utils";
import { PCDocument } from "../client/documents";
import { stringifyVirtualNode } from "@paperclip-ui/core";

describe(__filename + "#", () => {
  it(`Can open a simple document`, async () => {
    const { server } = await createMockHost({
      "/hello.pc": "div",
    });

    const client = server.createHostClient();

    const doc = await client.getDocuments().open("/hello.pc");

    expect((await doc.getSource()).getText()).to.eql("div");
  });

  it(`Text changes are synchronized between documents`, async () => {
    const { server } = await createMockHost({
      "/hello.pc": "div",
    });

    const client = server.createHostClient();
    const doc = await client.getDocuments().open("/hello.pc");
    const docSource = await doc.getSource();
    expect(docSource.getText()).to.eql("div");

    const client2 = server.createHostClient();
    const doc2 = await client2.getDocuments().open("/hello.pc");
    const doc2Source = await doc2.getSource();

    docSource.setText("blahh".split(""));

    expect(await doc2Source.getText()).to.eql("blahhdiv");
  });

  it(`The engine updates when the source doc changes`, async () => {
    const { server } = await createMockHost({
      "/hello.pc": "Hello World",
    });

    const client = server.createHostClient();
    const doc = (await client.getDocuments().open("/hello.pc")) as PCDocument;
    expect(stringifyVirtualNode(doc.getContent().preview)).to.eql(
      "Hello World"
    );

    const source = await doc.getSource();
    source.setText("abc".split(""));

    expect(stringifyVirtualNode(doc.getContent().preview)).to.eql(
      "abcHello World"
    );
  });

  it(`Changes from two docs converge into one`, async () => {
    const { server } = await createMockHost({
      "/hello.pc": "Hello World",
    });

    const client = server.createHostClient(true);
    const doc1 = (await client.getDocuments().open("/hello.pc")) as PCDocument;
    const src1 = await doc1.getSource();
    src1.setText("111".split(""));

    const client2 = server.createHostClient(true);
    const doc2 = (await client2.getDocuments().open("/hello.pc")) as PCDocument;
    const src2 = await doc2.getSource();
    src2.setText("222".split(""));

    await timeout(200);

    expect(stringifyVirtualNode(doc1.getContent().preview)).to.eql(
      "222111Hello World"
    );
  });
});
