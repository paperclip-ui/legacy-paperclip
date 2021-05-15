import { createSdk } from "@opendesign/sdk";
import { FigmaApi } from "./figma/api";
import { getFigmaUrlFileKeys } from "./figma/utils";
import {
  readConfig,
  readJSON,
  logInfo,
  resolveConfigPath,
  md5,
  httpGet,
  logError
} from "./utils";
import * as plimit from "p-limit";
import * as fsa from "fs-extra";
import * as path from "path";
import { DesignFacade } from "@opendesign/sdk/dist/design-facade";
import { kebabCase, uniq } from "lodash";
import { translateDesign } from "./translate";
import * as chalk from "chalk";

const HTTP_LIMIT = 6;

type PullOptions = {
  cwd: string;
  openDesignToken: string;
  figmaToken: string;
  url: string;
  dir: string;
};

export const pull = async ({
  cwd,
  openDesignToken,
  figmaToken,
  url,
  dir
}: PullOptions) => {
  const { useGoogleFonts } = readConfig(cwd, {
    useGoogleFonts: false
  });

  const figmaApi = new FigmaApi(figmaToken);

  logInfo(`Finding design files`);
  const fileKeys: string[] = await getFigmaUrlFileKeys(url, figmaApi);

  logInfo(`Importing ${fileKeys.length} designs (this might take a while)`);

  const od = createSdk({
    token: openDesignToken,
    cached: true,
    console: {
      level: "error"
    }
  });

  const limit = plimit(6);

  const designs = (await Promise.all(
    fileKeys.map(figmaFileKey =>
      limit(async () => {
        const cacheFileDir = path.join(
          cwd,
          ".paperclip-open-design",
          figmaFileKey
        );

        if (fsa.existsSync(cacheFileDir)) {
          const fileName = fsa
            .readdirSync(cacheFileDir)
            .find(name => /\.octopus$/.test(name));
          return od.openOctopusFile(path.join(cacheFileDir, fileName));
        }

        const design = await od.importFigmaDesign({
          figmaFileKey,
          figmaToken
        });
        fsa.mkdirpSync(cacheFileDir);
        await design.saveOctopusFile({
          filePath: path.join(
            cacheFileDir,
            path.basename(design.octopusFilename)
          )
        });
        return design;
      })
    )
  )) as DesignFacade[];

  const includes = [];

  if (useGoogleFonts) {
    logInfo(`Generating font files`);
    includes.push(...(await generateGoogleFontsFile(designs, dir)));
  }

  logInfo(`Generting code`);

  for (const design of designs) {
    await generateDesignFile(design, dir, includes);
  }

  logInfo(`Done!`);

  od.destroy();
};

const generateGoogleFontsFile = async (
  designs: DesignFacade[],
  dir: string
): Promise<string[]> => {
  let fonts = [];
  for (const design of designs) {
    fonts.push(
      ...(await design.getFonts()).map(font =>
        font.fontPostScriptName.replace(/-\w+$/, "")
      )
    );
  }

  fonts = uniq(fonts);

  let buffer = "<style>";

  for (const font of fonts) {
    try {
      let css = await httpGet({
        host: `fonts.googleapis.com`,
        path: `/css?family=${font}:100,200,300,400,500,600,700`
      });
      css = css.replace(/url\((.*?)\)/g, (_, url, ...args) => {
        return `url("${url}")`;
      });
      buffer += `${css}\n\n`;
    } catch (e) {
      logError(
        `Google font ${chalk.bold(
          font
        )} not found, you'll have to manually add it.`
      );
    }
  }

  buffer += "</style>";

  fsa.writeFileSync(path.join(dir, "google-fonts.pc"), buffer);

  return ["../../google-fonts.pc"];
};

const generateDesignFile = async (
  design: DesignFacade,
  dir: string,
  includes: string[]
) => {
  const name = path.basename(design.octopusFilename).replace(/.octopus$/, "");
  const projectDir = path.join(dir, "designs", kebabCase(name));
  fsa.mkdirpSync(projectDir);

  const { files } = await translateDesign(design, { includes });

  for (const { relativePath, content } of files) {
    const filePath = path.join(dir, "designs", relativePath);

    fsa.mkdirpSync(path.dirname(filePath));
    logInfo(`Writing ${relativePath}`);
    fsa.writeFileSync(filePath, content);
  }
};
