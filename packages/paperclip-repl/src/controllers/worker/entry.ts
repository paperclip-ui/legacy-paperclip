import { WindowConnection } from "../worker-connection";
import { REPLWorker } from "./index";

new REPLWorker(new WindowConnection(self)).init();
