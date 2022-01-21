import * as fs from "fs";
import * as url from "url";

export const fixFileUrlCasing = (href: string) => {
  if (href.indexOf("file://") !== 0) {
    return href;
  }
  const caseSensitivePath = fs.realpathSync.native(url.fileURLToPath(href));
  return url.pathToFileURL(caseSensitivePath).href;
};

export const createListener = (
  em: any,
  type: string,
  listener: (...args: any[]) => void
) => {
  em.on(type, listener);
  return () => em.off(type, listener);
};
