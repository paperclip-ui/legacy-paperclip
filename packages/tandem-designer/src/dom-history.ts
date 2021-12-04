import { createBrowserHistory } from "history";

// make _history accessible for cypress
const history = (window["$$history"] = createBrowserHistory());

export default history;
