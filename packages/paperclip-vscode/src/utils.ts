import * as fs from "fs";
import * as url from "url";

export const fixFileUrlCasing = (href: string) => {
  const caseSensitivePath = fs.realpathSync.native(url.fileURLToPath(href));
  return url.pathToFileURL(caseSensitivePath).href;
};