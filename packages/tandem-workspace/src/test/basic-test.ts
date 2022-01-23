import { createTestServer, TestServer } from "./utils";
import { expect } from "chai";
import * as url from "url";
import { PCDocument } from "@paperclip-ui/editor-engine/lib/client/documents";
import { stringifyVirtualNode } from "@paperclip-ui/core";

describe(__filename + "#", () => {
  let server: TestServer;

  it(`Can open a project`, async () => {
    server = await createTestServer({
      "hello.pc": "Hello world",
    });
    const client = server.createClient();
    const project = await client.openProject({
      uri: url.pathToFileURL(server.testDir).href,
    });
    const doc = (await project
      .getDocuments()
      .open(server.fixtureUris["hello.pc"])) as any as PCDocument;

    expect(stringifyVirtualNode(doc.getContent().preview)).to.eql(
      "Hello world"
    );
    server.stop();
  });

  it(`Can load Paperclip files `, async () => {
    server = await createTestServer({
      "hello.pc": "Hello world",
    });
    await new Promise((resolve) => setTimeout(resolve, 100));
    const client = server.createClient();
    const project = await client.openProject({
      uri: url.pathToFileURL(server.testDir).href,
    });
    const documents: PCDocument[] = [];
    for (const document of await project.openAllPaperclipDocuments()) {
      documents.push(document);
    }
    expect(documents.length).to.eql(1);
    expect(documents[0].uri).to.eql(`file:///tmp/__TEST__/fixtures/hello.pc`);
    server.stop();
  });

  it(`Loaded projects contain project directory info`, async () => {
    server = await createTestServer({
      "hello.pc": "Hello world",
    });
    const client = server.createClient();
    const project = await client.openProject({
      uri: url.pathToFileURL(server.testDir).href,
    });
    expect(project.getProperties().directoryPath).to.eql(
      "/tmp/__TEST__/fixtures"
    );
    server.stop();
  });
});
