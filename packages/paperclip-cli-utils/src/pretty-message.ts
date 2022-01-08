import * as path from "path";
import url from "url";
import { StringRange } from "@paperclip-ui/utils";
import chalk from "chalk";
import dedent from "dedent";

type Details = {
  range: StringRange;
  message: string;
};

export const getPrettyMessageFromError = (e, code, uri, cwd) => {
  const info = e.info || e;
  return info.range ? getPrettyMessage(info, code, uri, cwd) : null;
};

export const getPrettyMessage = (
  { range, message }: Details,
  code: string,
  uri: string,
  cwd: string
) => {
  const lines = code.split("\n");

  const chunk = lines.slice(range.start.line - 1, range.end.line);

  const highlightedLines = chunk.reduce((highlight, line, index) => {
    highlight.push(addLineNumber(line, range.start.line + index, lines.length));

    if (index === 0) {
      let underscoreLength;

      // same line
      if (range.end.line === range.start.line) {
        underscoreLength = range.end.column - (range.start.column - 1);
      } else {
        underscoreLength = line.length - range.start.column + 2;
      }

      highlight.push(
        addLineNumberPadding(
          " ".repeat(range.start.column - 1) + underline(underscoreLength),
          lines.length
        )
      );
    }

    // make sure that end is on a new line
    if (range.start.line !== range.end.line && index !== 0) {
      // in-between lines
      if (range.start.line + index < range.end.line && line.trim()) {
        highlight.push(
          addLineNumberPadding(underline(line.length), lines.length)
        );

        // end of line
      } else if (range.start.line + index === range.end.line) {
        highlight.push(
          addLineNumberPadding(underline(range.end.column - 1), lines.length)
        );
      }
    }

    return highlight;
  }, []);

  const buffer =
    dedent`
  \n
  ${chalk.cyan(path.relative(cwd, url.fileURLToPath(uri)))}:${chalk.yellow(
      range.start.line + ":" + range.start.column
    )} - ${chalk.red("error")}: ${message}\n\n
  ` +
    highlightedLines.join("\n") +
    "\n";

  return buffer;
};

const underline = (length: number) => chalk.red("^".repeat(length));

const addLineNumber = (
  line: string,
  number: number,
  high: number,
  colorize = true
) => {
  const prefix =
    `${number}` +
    " ".repeat(String(high).length + 2 - String(number).length) +
    "| ";

  return (colorize ? chalk.grey(prefix) : prefix) + line;
};

const addLineNumberPadding = (line: string, high: number) => {
  return " ".repeat(addLineNumber("", 0, high, false).length) + line;
};
