// TODO - identify yarn lock
import execa from "execa";
import { Logger } from "@paperclip-ui/common";

// TODO - add ident script for repo type
export class Package {
  constructor(private _cwd: string, private _logger: Logger) {}
  async install(packageName?: string) {
    // want to always run install script to ensure that project is in predictable state.
    // if (fs.existsSync(path.join(this._cwd, "node_modules"))) {
    //   this._logger.info(`modules exists, skipping install`);
    //   return;
    // }

    this._logger.info(`Running install script ⏱`);
    await execa(`yarn`, [`install`, `--silent`], {
      cwd: this._cwd,
      stdio: "inherit",
    });
    this._logger.info(`Done installing package ✅`);
  }
  run(script: string) {}
}
