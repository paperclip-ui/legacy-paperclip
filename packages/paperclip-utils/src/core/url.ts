export const fileURLToPath = url => {
  if (typeof url !== "string") {
    url = url.href;
  }
  return url.substr("file://".length);
};

export const pathToFileURL = filePath => {
  if (filePath.charAt(0) !== "/") {
    filePath = "/" + filePath;
  }
  return {
    href: `file://${filePath}`
  };
};
