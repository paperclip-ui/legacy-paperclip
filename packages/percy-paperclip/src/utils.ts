import * as crypto from "crypto";

export const timeout = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const sha1 = data => {
  return crypto
    .createHash("sha1")
    .update(data, "binary")
    .digest("hex");
};
