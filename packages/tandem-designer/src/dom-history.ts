import { createBrowserHistory } from "history";

// make _history accessible for cypress
const history =
  typeof window != "undefined"
    ? (window["$$history"] = createBrowserHistory())
    : null;

export default history;
