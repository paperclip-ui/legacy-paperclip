import { createMockRPCServer } from "@paperclip-ui/common";
import {} from "chai";
import { createMemoryHistory } from "history";
import { createTestServer } from "@tandem-ui/workspace/src/test/utils";
import { createAppStore } from "../components/Main/create-app-store";

test(`It can launch the designer with a fake backend`, async () => {
  const history = createMemoryHistory();
  const testServer = await createTestServer({
    "test.pc": "Hello world",
  });

  const store = createAppStore({
    history,
    createRPCClient() {
      console.log("CONN");
      return testServer.createConnection();
    },
  });
});
