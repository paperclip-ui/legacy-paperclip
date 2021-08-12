// import * as http from "http";
// import * as getPort from "get-port";
// import * as mime from "mime";
// import * as fs from "fs";
// import { sha1, timeout } from "./utils";
// export type StaticServer = {
//   allowFile(path: string): string;
//   dispose();
//   finished(): Promise<any>;
// };

// export const startStaticServer = async (): Promise<StaticServer> => {
//   const allowFiles = {};
//   let requestCount = 0;
//   const port = await getPort();
//   const server = http.createServer((req, res) => {
//     const token = req.url.match(/\/(\w+)/)[1];
//     const path = allowFiles[token];
//     if (!path) {
//       return res.end();
//     }
//     requestCount++;

//     const contentType = mime.getType(path);

//     res.setHeader("Content-Type", contentType);
//     fs.createReadStream(path)
//       .pipe(res)
//       .on("close", () => {
//         requestCount--;
//       });
//   });
//   server.listen(port);

//   return {
//     allowFile(path: string) {
//       const token = sha1(path);
//       allowFiles[token] = path;
//       return `http://127.0.0.1:${port}/${token}`;
//     },
//     async finished() {
//       while (1) {
//         await timeout(1000 * 10);
//         if (!requestCount) {
//           break;
//         }
//       }
//     },
//     dispose() {
//       server.close();
//     }
//   };
// };
