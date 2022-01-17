import { createTestServer, TestServer } from "./utils";
import { expect } from "chai";
import * as url from "url";
import { PCDocument } from "@paperclip-ui/editor-engine/lib/client/documents";
import { stringifyVirtualNode } from "@paperclip-ui/core";

describe(__filename + "#", () => {
  let server: TestServer;

  it(`Can open a new project`, async () => {
    server = await createTestServer({
      "hello.pc": "Hello world"
    });
    const client = server.createClient();
    const project = await client.openProject(url.pathToFileURL(server.testDir));
    const doc = (await project
      .getDocuments()
      .open(server.fixtureUris["hello.pc"])) as PCDocument;
    expect(stringifyVirtualNode(doc.getContent().preview)).to.eql(
      "Hello world"
    );
    server.stop();
  });
});
