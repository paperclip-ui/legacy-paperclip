import * as qs from "querystring";
import { accountConnected, AccountKind } from "../../../actions";

const oauthConnect = (url: string): Promise<any> => {
  return new Promise((resolve) => {
    const width = 500;
    const height = 500;

    const features = [
      `width=${width}`,
      `height=${height}`,
      `left=${window.screenX + (window.outerWidth - width) / 2}`,
      `top=${window.screenY + (window.outerHeight - height) / 2.5}`,
    ].join(", ");

    const oauthWindow = window.open(url, "OAuth connect", features);

    const timer = setInterval(() => {
      let params;
      try {
        params = qs.parse(oauthWindow.location.search.substr(1));
      } catch (e) {
        // access errors - wait for callback
      }

      if (params?.code) {
        clearInterval(timer);
        oauthWindow.close();
        resolve(params);
      }
    }, 250);
  });
};

export const connectGithub = async (dispatch: any) => {
  const state = `${Math.random()}.${Date.now()}`;
  const { code } = await oauthConnect(
    `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&state=${state}`
  );
  dispatch(
    accountConnected({
      kind: AccountKind.GitHub,
      details: { code, state },
    })
  );
};

export const connectGoogle = async (dispatch: any) => {
  const details = await oauthConnect(
    `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}`
  );
  dispatch(
    accountConnected({
      kind: AccountKind.Google,
      details,
    })
  );
};
