import { printCoverage, generateCoverageHTML } from "paperclip-coverage";
import * as fsa from "fs-extra";
import * as path from "path";
import * as glob from "glob";
import * as URL from "url";
import { createEngineDelegate, EngineMode } from "paperclip";
import {
  resolvePCConfig,
  PaperclipConfig,
  paperclipResourceGlobPattern,
  paperclipSourceGlobPattern,
  EngineErrorKind
} from "paperclip-utils";

const DEFAULT_COVERAGE_DIR = "pc-coverage";

export type CoverageOptions = {
  output?: string | boolean;
  cwd: string;
  save?: boolean;
};

export const coverage = ({ output, save, cwd }: CoverageOptions) => {
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

  if (output) {
    const coverageDir = output === true || save ? DEFAULT_COVERAGE_DIR : output;
    const outputDir = path.join(cwd, coverageDir);

    fsa.mkdirpSync(outputDir);
    generateCoverageHTML(report, { output: outputDir, cwd });
  } else {
    printCoverage(report);
  }
};
