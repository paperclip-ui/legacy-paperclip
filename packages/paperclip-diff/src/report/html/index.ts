import * as path from "path";
import * as fsa from "fs-extra";
import { DetectChangesResult, snapshot } from "../../snapshots";
import { exec } from "child_process";
import {
  FrameScreenshot,
  FrameScreenshotDiff,
  FrameSnapshot,
  getFrameScreenshots,
  getProjectDiffs,
  getProjectFrames,
  getProjectScreenshots,
  getProjectSnapshot,
  getScreenshotDiffs,
  getScreenshotPath
} from "../../state";
import * as pageStyles from "./page.pc";
import * as styles from "./report.pc";
import { logInfo } from "../../utils";
import { Html5Entities } from "html-entities";
const entities = new Html5Entities();

const DEFAULT_OUTPUT_DIR = "pc-diff";
const MAIN_CSS_PATH = path.join(__dirname, "../../assets/main.css");

export type WriteHTMLReportOptions = {
  gitDir: string;
  cwd: string;
  output?: string;
  open?: boolean;
} & DetectChangesResult;

export const writeHTMLReport = async (info: WriteHTMLReportOptions) => {
  const files = generateHTMLReport(info);
  const baseDir = getBaseDir(info);
  logInfo(`Writing HTML report...`);

  const otherScreenshotIds = getProjectScreenshots(
    info.deltaVersion,
    info.manifest
  ).map(diff => diff.id);

  for (const screenshot of getProjectScreenshots(
    info.currentVersion,
    info.manifest
  )) {
    fsa.cpSync(
      getScreenshotPath(info.gitDir, screenshot.id),
      path.join(baseDir, screenshot.id + ".png")
    );
    const diff = getScreenshotDiffs(screenshot, info.manifest).find(diff =>
      otherScreenshotIds.includes(diff.otherScreenshotId)
    );
    if (diff) {
      fsa.cpSync(
        getScreenshotPath(info.gitDir, diff.id),
        path.join(baseDir, diff.id + ".png")
      );
      fsa.cpSync(
        getScreenshotPath(info.gitDir, diff.otherScreenshotId),
        path.join(baseDir, diff.otherScreenshotId + ".png")
      );
    }
  }

  for (const fileName in files) {
    const filePath = path.join(baseDir, fileName);
    fsa.writeFileSync(filePath, files[fileName]);
  }
  logInfo(
    `HTML report written to ./${path.relative(info.cwd, baseDir)}/index.html`
  );
  if (info.open) {
    exec(`open ${baseDir}/index.html`);
  }
};

const generateHTMLReport = (info: WriteHTMLReportOptions) => {
  const files: Record<string, string> = {};
  const frames = getProjectFrames(
    getProjectSnapshot(info.currentVersion, info.manifest),
    info.manifest
  );
  for (const frame of frames) {
    files[frame.id + ".html"] = generateSnapshotPage(frame, info);
  }

  const sidebar = generateSidebarProps(info);

  // TODO - need to create summary page. For now we use alias to first page
  if (sidebar.length) {
    files["index.html"] = files[sidebar[0].id + ".html"];
  }
  files["main.css"] = fsa.readFileSync(MAIN_CSS_PATH, "utf-8");
  return files;
};

const getBaseDir = (info: WriteHTMLReportOptions) =>
  path.join(
    info.cwd,
    info.output || DEFAULT_OUTPUT_DIR,
    info.currentVersion,
    info.deltaVersion
  );

const generateSnapshotPage = (
  snapshot: FrameSnapshot,
  info: WriteHTMLReportOptions
) => {
  const screenshots = getFrameScreenshots(snapshot, info.manifest);
  const sourceFile = entities.encode(snapshot.sourceFilePath);
  const filePath = path.join(info.gitDir, snapshot.sourceFilePath);

  return pageStyles.default({
    head: `<link rel="stylesheet" href="./main.css" />`,
    children: styles.Report({
      title: entities.encode(snapshot.title),
      subtitle: `<a href="vscode://file/${filePath}/">${sourceFile}</a>`,
      sidebar: generateSidebar(snapshot, info),
      content: screenshots
        .map(screenshot => {
          return generateComparison(screenshot, info);
        })
        .join("\n")
    })
  });
};

const generateComparison = (
  screenshot: FrameScreenshot,
  info: WriteHTMLReportOptions
) => {
  const otherScreenshotIds = getProjectScreenshots(
    info.deltaVersion,
    info.manifest
  ).map(diff => diff.id);
  const diff = getScreenshotDiffs(screenshot, info.manifest).find(diff =>
    otherScreenshotIds.includes(diff.otherScreenshotId)
  );

  return [
    styles.Comparison({
      children: [
        styles.Screenshot({
          a: true,
          title: `A: ${info.currentVersion}`,
          children: `<img src="./${diff.screnshotId}.png" />`
        }),
        styles.Screenshot({
          b: true,
          title: `B: ${info.currentVersion}`,
          children: diff
            ? `<img src="./${diff.otherScreenshotId}.png" />`
            : `No screenshot found`
        })
      ]
    }),
    diff &&
      styles.Screenshot({
        c: true,
        title: "Changes",
        children: `<img src="./${diff.id}.png" />`
      }),
    styles.Divider({})
  ].join("\n");
};

const generateSidebarProps = (
  info: WriteHTMLReportOptions,
  activeSnapshot?: FrameSnapshot
) => {
  const project = getProjectSnapshot(info.currentVersion, info.manifest);
  const frames = getProjectFrames(project, info.manifest);
  const allProps = frames.map(frame => {
    const screenshots = getFrameScreenshots(frame, info.manifest);
    const diffs: FrameScreenshotDiff[] = screenshots.reduce(
      (diffs, screenshot) => {
        return [...diffs, ...getScreenshotDiffs(screenshot, info.manifest)];
      },
      []
    );

    const hasChanges = diffs.some(diff => diff.changeCount > 0);

    return {
      href: "./" + frame.id + ".html" + "#" + frame.id,
      id: frame.id,
      title: entities.encode(frame.title),
      src: "./" + screenshots[0].id + ".png",
      hasChanges,
      active: frame.id === activeSnapshot?.id,
      noChanges: !hasChanges
    };
  });

  allProps.sort((a, b) => {
    return a.hasChanges ? -1 : 1;
  });

  return allProps;
};

const generateSidebar = (
  activeSnapshot: FrameSnapshot,
  info: WriteHTMLReportOptions
) => {
  const allProps = generateSidebarProps(info, activeSnapshot);
  return allProps.map(props => styles.Thumbnail(props));
};
