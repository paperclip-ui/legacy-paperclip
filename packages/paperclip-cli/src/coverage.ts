import { printCoverage, writeCoverageHTML } from "paperclip-coverage";
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
  output?: string;
  reportKind: "html" | "stdout";
  cwd: string;
};

export const coverage = ({ output, reportKind, cwd }: CoverageOptions) => {
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

  if (reportKind === "html") {
    const coverageDir = output || DEFAULT_COVERAGE_DIR;
    const outputDir = path.join(cwd, coverageDir);

    fsa.mkdirpSync(outputDir);
    writeCoverageHTML(report, { output: outputDir, cwd });
    console.log(`Write .${outputDir.replace(cwd, "")}`);
  } else {
    printCoverage(report, cwd);
  }
};
