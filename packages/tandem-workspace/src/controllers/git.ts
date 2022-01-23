import * as fsa from "fs-extra";
import execa from "execa";
import { exec } from "child_process";
import { ok } from "@tandem-ui/common";
import { Logger } from "@paperclip-ui/common";

export class Repository {
  /**
   */

  constructor(readonly localDirectory: string, private _logger: Logger) {}

  /**
   */

  async pull(url: string) {
    await execa(`git`, ["pull", this.localDirectory], {
      cwd: this.localDirectory,
      stdio: "inherit",
    });
  }

  /**
   */

  async hasChanges() {
    const { stdout } = await this._exec("git", ["status"]);
    return !stdout.includes(`nothing to commit`);
  }

  /**
   */

  async addAllChanges() {
    this._logger.info(`Adding all changes`);
    await this._exec(`git`, [`add`, `-A`], {
      stdio: "inherit",
    });
  }

  /**
   */

  async checkout(branchName: string) {
    this._logger.info(`Setting branch`);
    if (await this.hasChanges()) {
    }
    await this._exec(`git`, [`checkout`, branchName], {
      stdio: "inherit",
    });
  }

  /**
   */

  async add(paths: string) {
    // TODO
  }

  /**
   */

  async commit(description: string) {
    this._logger.info(`Committing changes: "${description}"`);
    await execa(`git`, [`commit`, `-m`, description], {
      cwd: this.localDirectory,
      stdio: "inherit",
    });
  }

  /**
   */

  async push() {
    const currentBranch = await this.getCurrentBranch();
    await execa(`git`, [`push`, `origin`, currentBranch], {
      cwd: this.localDirectory,
      stdio: "inherit",
    });
  }

  /**
   */

  async clone(url: string) {
    const exists = await fsa.pathExists(this.localDirectory);
    if (exists) {
      return this.pull(url);
    }

    const { hostname } = new URL("http://" + url.replace(/\:.*/, ""));

    this._logger.info(`Cloning ${url} to ${this.localDirectory} ⏱`);

    // Probably running locally
    try {
      await new Promise((resolve, reject) => {
        exec(
          `ssh-keyscan -t rsa ${hostname} >> /root/.ssh/known_hosts`,
          ok(resolve, reject)
        );
      });
    } catch (e) {
      this._logger.warn(e.message);
    }

    await execa(`git`, ["clone", url, this.localDirectory], {
      stdio: "inherit",
    });

    this._logger.info(`Done cloning ${url} ✅`);
    // await fsa.mkdirp(this.localDirectory);
  }

  private async _exec(command: string, args: any[], options: any = {}) {
    return await execa(command, args, {
      cwd: this.localDirectory,
      ...options,
    });
  }

  /**
   */

  async getBranches() {
    try {
      // turn off pagination every time
      await execa(`git`, [`config`, `--global`, `pager.branch`, `false`], {
        cwd: this.localDirectory,
      });
    } catch (e) {
      this._logger.info(e.message);
    }

    try {
      const { stdout } = await execa(`git`, [`branch`], {
        cwd: this.localDirectory,
      });

      return stdout.replace(/\*?[^\S\r\n]/g, "").split("\n");
    } catch (e) {
      return [];
    }
  }

  /**
   */

  async getCurrentBranch() {
    try {
      const { stdout } = await execa(`git`, [`branch`, `--show-current`], {
        cwd: this.localDirectory,
      });
      return stdout.trim();
    } catch (e) {
      return null;
    }
  }
}
