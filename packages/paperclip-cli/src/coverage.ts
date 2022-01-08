import { printCoverage, writeCoverageHTML } from "@paperclip-ui/coverage";
import * as fsa from "fs-extra";
import * as path from "path";
const chalk = require("chalk");
import { exec } from "child_process";
import * as glob from "glob";
import * as URL from "url";
import { createEngineDelegate, EngineMode } from "@paperclip-ui/core";
import {
  resolvePCConfig,
  PaperclipConfig,
  paperclipResourceGlobPattern,
  paperclipSourceGlobPattern,
  EngineErrorKind
} from "@paperclip-ui/utils";

const DEFAULT_COVERAGE_DIR = ".paperclip/cov";

export type CoverageOptions = {
  output?: string;
  html?: boolean;
  open?: boolean;
  cwd: string;
};

export const coverage = ({ output, html, cwd, open }: CoverageOptions) => {
  const [config, url] = resolvePCConfig(fsa)(cwd);
  const engine = createEngineDelegate({
    mode: EngineMode.MultiFrame
  });

  const configPath = URL.fileURLToPath(url);

  const sources = glob.sync(
    paperclipSourceGlobPattern(
      path.join(path.dirname(configPath), config.srcDir)
    )
  );

  for (const source of sources) {
    engine.open(URL.pathToFileURL(source).href);
  }
  console.log(`Generating coverage report...`);

  const report = engine.generateCoverageReport();

  printCoverage(report, cwd);

  if (html) {
    const coverageDir = output || DEFAULT_COVERAGE_DIR;
    const outputDir = path.join(cwd, coverageDir);

    fsa.mkdirpSync(outputDir);
    writeCoverageHTML(report, { output: outputDir, cwd });
    console.log(
      chalk.bold.cyan(
        `\nWrite HTML coverage to .${outputDir.replace(cwd, "")}\n`
      )
    );
    if (open) {
      exec(`open ${outputDir}/index.html`);
    }
  }
};
