import { ZeplinClient } from "./api";
import * as inquirer from "inquirer";
import Layer from "zeplin-extension-style-kit/elements/layer";
import FontFace from "zeplin-extension-style-kit/elements/fontFace";
import TextStyle from "zeplin-extension-style-kit/elements/textStyle";
import Color from "zeplin-extension-style-kit/values/color";
import RuleSet from "zeplin-extension-style-kit/ruleSet";
import { Layer as LayerModel } from "@zeplin/extension-model";

export type PullOptions = {
  targetDirectory: string;
  personalAccessToken: string;
  projectId?: string;
};

export const pull = async ({
  personalAccessToken,
  targetDirectory,
  projectId
}: PullOptions) => {
  let prompted = false;
  const client = new ZeplinClient({
    personalAccessToken
  });

  if (!projectId) {
    projectId = await pickProjectId(client);
    prompted = true;
  }

  const colors = await client.getProjectColors(projectId);
  const textStyles = await client.getProjectTextStyles(projectId);
  const spacing = await client.getProjectSpacing(projectId);
  const components = await client.getProjectComponents(projectId);

  console.log(colors);
  // TODO
  for (const component of components) {
    const info = await client.getProjectComponent(projectId, component.id);
    console.log(new LayerModel(info.layers[0]));
    const layer = new Layer(new LayerModel(info.layers[0]));
    console.log(JSON.stringify(info.layers[0], null, 2));
    console.log(layer.fillColor.toStyleValue({ colorFormat: "hsl" }, colors));
    // const componentStyleInfo =
  }

  // console.log(l.style);

  if (prompted) {
    console.log("");
    console.log("FYI, can use this command next time to skip the prompts: ");
    console.log(
      `zeplin-paperclip pull ${targetDirectory} --personal-access-token=${personalAccessToken} --project-id=${projectId}`
    );
  }
};

const castLayer = ({
  id,
  source_id,
  type,
  name,
  rect,
  fills,
  borders,
  shadows,
  blur,
  opacity,
  blend_mode,
  border_radius
}) => {
  return {
    id,
    source_id,
    type,
    name,
    rect,
    fills,
    borders,
    shadows,
    blur,
    opacity,
    blend_mode,
    border_radius
  };
};

const pickProjectId = async (client: ZeplinClient) => {
  const projects = await client.getProjects();
  console.log(projects);
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
