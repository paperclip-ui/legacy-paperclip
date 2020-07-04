import request from "axios";
import * as querystring from "querystring";

export type FigmaClientOptions = {
  personalAccessToken: string;
};

export class ZeplinClient {
  constructor(readonly options: FigmaClientOptions) {}

  async getProjects() {
    return await this._request(`/projects`);
  }

  async getProjectColors(projectId: string) {
    return await this._request(`/projects/${projectId}/colors`);
  }

  async getProjectTextStyles(projectId: string) {
    return await this._request(`/projects/${projectId}/text_styles`);
  }

  async getProjectSpacing(projectId: string) {
    return await this._request(`/projects/${projectId}/spacing_tokens`);
  }

  async getProjectComponents(projectId: string) {
    return await this._request(`/projects/${projectId}/components`);
  }

  async getProjectComponent(projectId: string, componentId: string) {
    return await this._request(
      `/projects/${projectId}/components/${componentId}/versions/latest`
    );
  }

  private async _request(pathname: string, queryParams?: any) {
    let url = `https://api.zeplin.dev/v1${pathname}`;

    if (queryParams) {
      url += "?" + querystring.stringify(queryParams);
    }
    console.log(url);

    const headers = {
      Authorization: `Bearer ${this.options.personalAccessToken}`
    };

    const response = await request({
      url,
      headers
    });

    return response.data;
  }
}
