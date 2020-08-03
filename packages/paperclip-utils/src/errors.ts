// import * as path from "path";
// import url from "url";
// import chalk from "chalk";
// import dedent from "dedent";
// import { SourceLocation } from "./base-ast";

// type Details = {
//   location: SourceLocation;
//   message: string;
// };

// export const getPrettyMessage = (
//   { location, message }: Details,
//   code: string,
//   uri: string,
//   cwd: string
// ) => {
//   const beforeLines = code.substr(0, location.start).split("\n");
//   const startLinePrefix = beforeLines[beforeLines.length - 1];
//   const startLineNumber = beforeLines.length;
//   const start = code.substr(location.start);
//   const chunk = start.substr(0, location.end - location.start);

//   const highlightedLines =
//     startLinePrefix +
//     chunk
//       .split("\n")
//       .reduce((highlight, line, index) => {
//         highlight.push(line);
//         const prefix = index === 0 ? " ".repeat(startLinePrefix.length) : "";
//         highlight.push(prefix + chalk.red("^".repeat(line.length)));
//         return highlight;
//       }, [])
//       .join("\n");

//   const buffer = dedent`
//   \n
//   ${chalk.cyan(path.relative(cwd, url.fileURLToPath(uri)))}:${chalk.yellow(
//     startLineNumber
//   )} - ${chalk.red("error")}: ${message}

//   ${addLineNumbers(highlightedLines, startLineNumber)}\n

//   `;

//   // return addLineNumbers(highlightedLines.join("\n"), startLine);

//   return buffer;
// };

// const addLineNumbers = (buffer: string, start: number) => {
//   return buffer
//     .split("\n")
//     .map((line, index) => {
//       const num = start + index;
//       const prefix =
//         `${num}` +
//         " ".repeat(Math.max(0, String(start).length + 2 - String(num).length)) +
//         "| ";
//       const buffer = chalk.grey(prefix) + line;
//       return buffer;
//     })
//     .join("\n");
// };
