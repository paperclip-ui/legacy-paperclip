export const fileURLToPath = url => {
  return url.substr("file://".length);
};

export const pathToFileURL = filePath => {
  return {
    href: `file://${filePath}`
  };
};
