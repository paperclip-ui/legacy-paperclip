import * as fsa from "fs-extra";
import * as path from "path";
import { exec } from "child_process";
import { ok } from "@tandem-ui/common";
import { Logger } from "@paperclip-ui/common";

const ID_RSA_FILE = `/root/.ssh/id_rsa`;

export class SSHKeys {
  constructor(private _logger: Logger) {}
  async setSSHKey(value: string) {
    this._logger.info(`Saving SSH private SSH key`);

    await fsa.mkdirp(path.dirname(ID_RSA_FILE));

    await fsa.writeFile(ID_RSA_FILE, value, "utf-8");

    // required by SSH client
    await fsa.chmod(ID_RSA_FILE, "400");

    await new Promise((resolve, reject) =>
      exec(
        `eval $(ssh-agent) && ssh-add -k ${ID_RSA_FILE}`,
        ok(resolve, reject)
      )
    );
  }
}
