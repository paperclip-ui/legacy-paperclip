import { createSdk } from "@opendesign/sdk";
import { FigmaApi } from "./figma/api";
import { getFigmaUrlFileKeys } from "./figma/utils";
import { readConfig, readJSON, logInfo, resolveConfigPath, md5 } from "./utils";
import * as plimit from "p-limit";
import * as fsa from "fs-extra";
import * as path from "path";
import { DesignFacade } from "@opendesign/sdk/dist/design-facade";
import { kebabCase } from "lodash";
import { translateDesign } from "./translate";

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

  // designs[0].saveOctopusFile()

  logInfo(`Generting code`);

  for (const design of designs) {
    await generateDesignFile(design, dir);
  }

  logInfo(`Done!`);

  od.destroy();
};

const generateDesignFile = async (design: DesignFacade, dir: string) => {
  const name = path.basename(design.octopusFilename).replace(/.octopus$/, "");
  const projectDir = path.join(dir, kebabCase(name));
  fsa.mkdirpSync(projectDir);

  const { files } = await translateDesign(design);

  for (const { relativePath, content } of files) {
    const filePath = path.join(dir, relativePath);

    fsa.mkdirpSync(path.dirname(filePath));
    logInfo(`Writing ${relativePath}`);
    fsa.writeFileSync(filePath, content);
    console.log(content);
  }
};
