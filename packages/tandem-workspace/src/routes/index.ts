import { Kernel } from "../core/kernel";
import express from "express";
import * as path from "path";
import * as URL from "url";

export const addRoutes = (kernel: Kernel) => {
  addAPIRoutes(kernel);
};

const addAPIRoutes = ({ expressServer, workspace, logger }: Kernel) => {
  expressServer.get(`/api/hello`, async (req, res) => {
    res.send({ message: "OK" });
  });
  expressServer.post(`/api/start`, express.json(), async (req, res) => {
    const { url, branch } = req.body;
    await workspace.start(url, branch);
    res.send({ message: "OK" });
  });
  expressServer.post(`/api/ssh-key`, express.json(), async (req, res) => {
    await workspace.setSSHKey(req.body.value);
    res.send({ message: "OK" });
  });
  expressServer.use("/file/*", (req, res, next) => {
    const filePath = URL.fileURLToPath(
      decodeURIComponent(path.normalize(req.params["0"]))
    );
    // const found = localResourceRoots.some(
    //   root => filePath.toLowerCase().indexOf(root.toLowerCase()) === 0
    // );
    // if (!found) {
    //   return next();
    // }
    res.sendFile(filePath);
  });
};
