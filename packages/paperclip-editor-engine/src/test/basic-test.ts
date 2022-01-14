import { expect } from "chai";
import * as Automerge from "automerge";
import { createMockEngine } from "@paperclip-ui/core/lib/test/utils";
import { EditorHost } from "../host/host";
import { createMockServer } from "./utils";
import { EditorClient } from "../client/client";

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

    expect(doc.getSourceText()).to.eql("div");
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
    expect(doc.getSourceText()).to.eql("div");

    const client2 = new EditorClient(server.createClient());
    const doc2 = await client2.open("/hello.pc");

    doc.insertSourceText("blahh".split(""));

    expect(doc2.getSourceText()).to.eql("blahhdiv");
  });

  it(`When text changes are applied to the document, the engine updates`, async () => {});
});
