// Note: https://blog.prototypr.io/design-tokens-with-figma-aef25c42430f
import { FigmaClient } from "./api";
import * as plimit from "p-limit";

export type PullOptions = {
  targetDirectory: string;
  personalAccessToken: string;
  teamId: string;
};

export const pull = async ({ personalAccessToken, teamId }: PullOptions) => {
  const client = new FigmaClient({ personalAccessToken });

  const response = await client.getTeamStyles(teamId);

  if (response.error) {
    console.error("Error!");
    console.error(response);
    return;
  }

  const limit = plimit(5);

  const styles = await Promise.all(
    response.meta.styles.map(style => {
      return limit(async () => {
        const resp = await client.getFile(style.file_key, {
          ids: style.node_id
        });
        console.log(JSON.stringify(resp, null, 2));
        return resp.styles[style.node_id];
      });
    })
  );

  console.log(styles);
};
