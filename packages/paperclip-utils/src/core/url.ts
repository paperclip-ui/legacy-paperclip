export const fileURLToPath = url => {
  if (typeof url !== "string") {
    url = url.href;
  }
  return url.substr("file://".length);
};

export const pathToFileURL = filePath => {
  return {
    href: `file://${filePath}`
  };
};
