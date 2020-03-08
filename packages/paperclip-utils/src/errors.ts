export const getPrettyMessage = (
  { location, message }: any,
  content: string,
  filePath: string
) => {
  let buffer = "";
  buffer += `Error: ${message}\n`;
  buffer += `In ${filePath}:\n`;
  const { lineStart, lines } = getLines(content, location.start, location.end);
  buffer += `L${lineStart} ` + content.substr(location.start, location.end);
  return buffer;
};

const getLines = (content: string, start: number, end: number) => {
  const lines = content.split("\n");
  let startLineIndex = -1;
  let endLineIndex = -1;

  let cpos = 0;

  for (let i = 0, { length } = lines; i < length; i++) {
    const line = lines[i];
    cpos += line.length;

    if (startLineIndex === -1 && cpos >= start) {
      startLineIndex = i;
    }

    if (startLineIndex !== -1 && endLineIndex === -1 && cpos <= end) {
      endLineIndex = i;
    }
  }

  return {
    lineStart: startLineIndex,
    lines: lines.slice(startLineIndex, endLineIndex + 1)
  };
};
