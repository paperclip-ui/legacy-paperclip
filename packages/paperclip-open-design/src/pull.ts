import { createSdk } from "@opendesign/sdk";
import { FigmaApi } from "./figma/api";
import { extractSourceUrlInfo } from "./figma/utils";
import { readConfig, readJSON, resolveConfigPath } from "./utils";
import * as plimit from "p-limit";
import * as path from "path";

const HTTP_LIMIT = 6;

type PullOptions = {
  cwd: string;
  openDesignToken: string;
  figmaToken: string;
  url: string;
};

export const pull = async ({
  cwd,
  openDesignToken,
  figmaToken,
  url
}: PullOptions) => {
  const configPath = resolveConfigPath(cwd);

  const figmaApi = new FigmaApi(figmaToken);

  const limit = plimit(HTTP_LIMIT);

  const fileKeys = await getFigmaUrlFileKeys(url, figmaApi);

  const od = createSdk({ token: openDesignToken });

  for (const figmaFileKey of fileKeys) {
    const design = await od.importFigmaDesign({
      figmaFileKey,
      figmaToken
    });

    const name = path.basename(design.octopusFilename).replace(/.octopus$/, "");

    console.log(name);
  }

  // const pages = design.getPages();
  // console.log(pages);
  // for (const page of pages) {
  // }
};

const getFigmaUrlFileKeys = async (url: string, api: FigmaApi) => {
  const urlInfo = extractSourceUrlInfo(url);

  if (urlInfo.fileKey) {
    return [urlInfo.fileKey];
  }

  const limit = plimit(HTTP_LIMIT);

  if (urlInfo.teamId) {
    const { projects } = await api.getTeamProjects(urlInfo.teamId);

    const fileKeys = Array.prototype.concat
      .call(
        [],
        ...(
          await Promise.all(
            projects.map(project =>
              limit(() => api.getProjectFiles(project.id))
            )
          )
        ).map(info => (info as any).files)
      )
      .map(file => file.key);

    return fileKeys;
  }
};
