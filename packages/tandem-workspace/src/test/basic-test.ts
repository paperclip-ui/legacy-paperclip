import { createTestServer, TestServer } from "./utils";

describe(__filename + "#", () => {
  let server: TestServer;

  it(`Can open a new project`, async () => {
    server = await createTestServer({
      "hello.pc": "Hello world"
    });
    const client = server.createClient();
    server.stop();
  });
});
