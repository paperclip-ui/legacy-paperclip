import request from "axios";
import * as querystring from "querystring";

export type FigmaClientOptions = {
  personalAccessToken: string;
};

export enum Namespace {
  Projects = "projects",
  Styleguides = "styleguides",
}

export class ZeplinClient {
  constructor(readonly options: FigmaClientOptions) {}

  async getProjects() {
    return await this._request(`/projects`);
  }

  async getColors(nsId: string, ns = Namespace.Projects) {
    return await this._request(`/${ns}/${nsId}/colors`);
  }

  async getTextStyles(nsId: string, ns = Namespace.Projects) {
    return await this._request(`/${ns}/${nsId}/text_styles`);
  }

  async getSpacing(nsId: string, ns = Namespace.Projects) {
    return await this._request(`/${ns}/${nsId}/spacing_tokens`);
  }

  async getComponents(nsId: string, ns = Namespace.Projects) {
    return await this._request(`/${ns}/${nsId}/components`);
  }
  async getAllComponents(nsId: string, ns = Namespace.Projects) {
    const sections = await this.getComponents(nsId, ns);
    return [];
  }
  async getComponentSections(nsId: string, ns = Namespace.Projects) {
    return await this._request(`/${ns}/${nsId}/components`);
  }

  async getComponent(
    projectId: string,
    componentId: string,
    ns = Namespace.Projects
  ) {
    return await this._request(
      `/${ns}/${projectId}/components/${componentId}/versions/latest`
    );
  }

  private async _request(pathname: string, queryParams?: any) {
    let url = `https://api.zeplin.dev/v1${pathname}`;

    if (queryParams) {
      url += "?" + querystring.stringify(queryParams);
    }

    const headers = {
      Authorization: `Bearer ${this.options.personalAccessToken}`,
    };

    const response = await request({
      url,
      headers,
    });

    return response.data;
  }
}
