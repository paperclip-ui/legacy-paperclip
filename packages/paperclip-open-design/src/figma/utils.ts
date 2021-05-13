import { camelCase } from "lodash";
import * as chalk from "chalk";
import * as fs from "fs";
import * as path from "path";
import * as plimit from "p-limit";
import { spawn } from "child_process";
import { FigmaApi } from "./api";
export const pascalCase = (value: string) =>
  value.substr(0, 1).toUpperCase() + camelCase(value.substr(1));

export type SourceUrlInfo = Partial<{
  fileKey?: string;
  name?: string;
  teamId?: string;
}>;

export const extractSourceUrlInfo = (url: string): SourceUrlInfo => {
  const matches1 = url.match(
    /https:\/\/www.figma.com\/files\/(.*?)\/team\/(.*?)\//
  );
  let fileKey: string;
  let teamId: string;
  let name: string;
  if (matches1) {
    // projectId = matches1[1];
    teamId = matches1[2];
  }
  const matches2 = url.match(
    /https:\/\/www.figma.com\/files\/(.*?)\/project\/(.*?)\/(.*?)/
  );
  if (matches2) {
    fileKey = matches2[2];
    name = matches2[3];
    // teamId = matches2[2];
  }

  const matches3 = url.match(
    /https:\/\/www.figma.com\/files\/project\/(.*?)\/(.*?)/
  );
  if (matches3) {
    fileKey = matches3[1];
    name = matches3[2];
  }

  const matches4 = url.match(
    /https:\/\/www.figma.com\/file\/(.*?)\/([^\?\/]+)/
  );
  if (matches4) {
    fileKey = matches4[1];
    name = matches4[2];
  }

  const matches5 = url.match(
    /https\:\/\/www.figma.com\/files\/team\/(.*?)\/([^\?\/]+)/
  );

  if (matches5) {
    teamId = matches5[1];
    name = matches5[2];
  }

  return {
    fileKey,
    name,
    teamId
  };
};

export const exec = (
  command: string,
  args: string[],
  cwd: string,
  pipe: boolean = true
) => {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { cwd });
    if (pipe) {
      proc.stdout.pipe(process.stdout);
    }
    proc.stderr.pipe(process.stderr);
    proc.on("exit", resolve);
  });
};

export const getFigmaUrlFileKeys = async (url: string, api: FigmaApi) => {
  const urlInfo = extractSourceUrlInfo(url);

  if (urlInfo.fileKey) {
    return [urlInfo.fileKey];
  }

  const limit = plimit(6);

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
