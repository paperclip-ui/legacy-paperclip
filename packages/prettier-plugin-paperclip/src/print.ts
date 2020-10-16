import { notEqual } from "assert";
import { FastPath, Printer } from "prettier";

export const print = (path: FastPath, options: Object, print) => {
  const node = path.getValue();
  // console.log("PRINT");
  // console.log(node);
  return node;
};
