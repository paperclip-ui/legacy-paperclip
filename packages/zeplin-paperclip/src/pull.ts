import { Namespace, ZeplinClient } from "./api";
import * as path from "path";
import * as inquirer from "inquirer";
import * as plimit from "p-limit";
import { mkdirpSync, writeFileSync } from "fs-extra";
import Layer from "zeplin-extension-style-kit/elements/layer";
import FontFace from "zeplin-extension-style-kit/elements/fontFace";
import TextStyle from "zeplin-extension-style-kit/elements/textStyle";
import Color from "zeplin-extension-style-kit/values/color";
import RuleSet from "zeplin-extension-style-kit/ruleSet";
import * as zmodel from "@zeplin/extension-model";
import { castLayer, castColor, castTextStyle } from "./cast";
import { VariableMap, ColorFormat, TypographyMap } from "./state";
import { stringifyColor, generateIdentifier } from "./utils";
import { DEFAULT_COLOR_FORMAT } from "./contants";
import {
  compileGlobalColorVariables,
  compileLayers,
  compileTypography,
  compileGlobalSpacingVariables
} from "./pc-compiler";

export type PullOptions = {
  targetDirectory: string;
  personalAccessToken: string;
  projectId?: string;
  styleguideId?: string;
  colorFormat?: ColorFormat;
  includeComponents?: boolean;
};

export const pull = async ({
  personalAccessToken,
  targetDirectory,
  projectId,
  styleguideId,
  colorFormat = DEFAULT_COLOR_FORMAT,
  includeComponents
}: PullOptions) => {
  const ns = styleguideId ? Namespace.Styleguides : Namespace.Projects;
  const targetId = styleguideId || projectId;
  const cwd = process.cwd();
  const targetDirectoryPath = path.join(cwd, targetDirectory);

  let prompted = false;
  const client = new ZeplinClient({
    personalAccessToken
  });

  if (!projectId && !targetId) {
    projectId = await pickProjectId(client);
    prompted = true;
  }

  const limit = plimit(6);

  const [
    colorVars,
    typographyMixins,
    spacingVars,
    components
  ] = await Promise.all([
    limit(() => getColorVarMap(targetId, colorFormat, client, ns)),
    limit(() => getTypographyMap(targetId, colorFormat, client, ns)),
    limit(() => getSpacingVarMap(targetId, colorFormat, client, ns)),
    limit(() => includeComponents && client.getComponents(targetId, ns))
  ]);

  const organisms: Record<string, any> = {};

  const atoms = {
    colors: compileGlobalColorVariables(colorVars),
    spacing: compileGlobalSpacingVariables(spacingVars),
    typography: compileTypography(typographyMixins, colorFormat, colorVars)
  };

  if (components) {
    await Promise.all(
      components.map(component =>
        limit(async () => {
          const info = await client.getComponent(targetId, component.id, ns);
          organisms[generateIdentifier(component.name).toLowerCase()] = {
            code: compileLayers(
              info.layers,
              colorFormat,
              colorVars,
              typographyMixins,
              { name: component.name, width: info.width, height: info.height }
            )
          };
        })
      )
    );
  }

  const fileContents = includeComponents
    ? { tokens: atoms, components: organisms }
    : atoms;

  writeFiles(fileContents, targetDirectoryPath);

  if (prompted) {
    console.log("");
    console.log("FYI, can use this command next time to skip the prompts: ");
    console.log(
      `zeplin-paperclip pull ${targetDirectory} --personal-access-token=${personalAccessToken} --project-id=${projectId}`
    );
  }
};

const writeFiles = (map: any, directory: string) => {
  for (const key in map) {
    const value = map[key];
    if (value.code) {
      mkdirpSync(directory);
      const filePath = path.join(directory, `${key}.pc`);
      console.log(`Writing ${path.relative(process.cwd(), filePath)}`);
      writeFileSync(filePath, value.code);
    } else {
      writeFiles(value, path.join(directory, key));
    }
  }
};

export const getColorVarMap = async (
  projectId: string,
  colorFormat: ColorFormat,
  client: ZeplinClient,
  ns = Namespace.Projects
): Promise<VariableMap> => {
  return (await client.getColors(projectId, ns))
    .map(castColor)
    .reduce((map, color) => {
      const kitColor = new Color(color);
      const value = `var(--${generateIdentifier(color.name)})`;
      map[kitColor.valueOf().toString()] = value;
      map[value] = kitColor.toStyleValue({ colorFormat }, null);
      return map;
    }, {});
};

export const getSpacingVarMap = async (
  projectId: string,
  colorFormat: ColorFormat,
  client: ZeplinClient,
  ns = Namespace.Projects
): Promise<VariableMap> => {
  return (await client.getSpacing(projectId, ns)).reduce((map, spacing) => {
    const value = `var(--${generateIdentifier(spacing.name)})`;
    map[value] = `${spacing.value}px`;
    return map;
  }, {});
};

export const getTypographyMap = async (
  projectId: string,
  colorFormat: ColorFormat,
  client: ZeplinClient,
  ns = Namespace.Projects
): Promise<TypographyMap> => {
  return (await client.getTextStyles(projectId, ns))
    .map(castTextStyle)
    .reduce((map, textStyle) => {
      map[generateIdentifier(textStyle.name).toLowerCase()] = textStyle;
      return map;
    }, {});
};

const pickProjectId = async (client: ZeplinClient) => {
  const projects = await client.getProjects();
  const resp = await inquirer.prompt([
    {
      type: "list",
      name: "projectId",
      message: "Pick a project",
      choices: projects.map(({ id, name }) => ({
        name,
        value: id
      }))
    }
  ]);

  return resp.projectId;
};
