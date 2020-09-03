import * as path from "path";
import * as fs from "fs";
import http from "http";
import sockjs from "sockjs";
import getPort from "get-port";
import { Engine } from "paperclip";
import { fstat } from "fs";

export type ServerOptions = {
  // engine: Engine
  localResourceRoots: string[];
  port?: number;
};

export const start = async (options: ServerOptions) => {
  const port = await getPort({ port: options.port });

  const io = sockjs.createServer();
  io.on("connection", conn => {
    console.log("CON");
  });

  const server = http.createServer(
    serveStatic(path.join(__dirname, "..", "dist"))
  );
  io.installHandlers(server, { prefix: "/rt" });
  server.listen(port);

  console.info(`Listening on port %d`, port);

  return {
    port
  };
};

const serveStatic = (root: string) => (req, res) => {
  const filePath = path.join(root, path.normalize(req.url));
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    return res.end("file not found");
  }
  res.writeHead(200);
  fs.createReadStream(filePath).pipe(res);
};

start({ localResourceRoots: [] });
