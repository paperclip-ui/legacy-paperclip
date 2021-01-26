import * as https from "https";
import * as qs from "querystring";

export class FigmaApi {
  constructor(readonly personalAccessToken: string) {}
  getFile(fileKey: string, options: any = {}) {
    return this._get(`/v1/files/${fileKey}`, { geometry: "paths", ...options });
  }

  getVersions(fileKey: string) {
    return this._get(`/v1/version/${fileKey}`);
  }
  getTeamProjects(teamId: string) {
    return this._get(`/v1/teams/${teamId}/projects`);
  }
  getProjectFiles(projectId: number) {
    return this._get(`/v1/projects/${projectId}/files`);
  }
  getImage(fileKey: string, options: any) {
    return this._get(`/v1/images/${fileKey}`, options);
  }
  getComponent(key: string) {
    return this._get(`/v1/components/${key}`);
  }
  getImageFills(key: string) {
    return this._get(`/v1/files/${key}/images`);
  }

  private _get(pathname: string, query: Record<string, string> = {}) {
    const search = Object.keys(query).length ? "?" + qs.stringify(query) : "";
    return new Promise<any>((resolve, reject) => {
      https.get(
        {
          headers: {
            "X-FIGMA-TOKEN": this.personalAccessToken
          },
          hostname: "api.figma.com",
          path: pathname + search
        },
        res => {
          let buffer = "";

          res.on("data", chunk => (buffer += String(chunk)));
          res.on("end", () => {
            if (res.statusCode === 200) {
              const result = JSON.parse(buffer);
              resolve(result);
            } else {
              try {
                reject(JSON.parse(buffer));
              } catch (e) {
                reject(buffer);
              }
            }
          });
        }
      );
    });
  }
}
