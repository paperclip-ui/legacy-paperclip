import request from "axios";
import * as querystring from "querystring";

export type FigmaClientOptions = {
  personalAccessToken: string;
};

export type FigmaResponse<TMeta> = {
  error: boolean;
  status: number;
  meta: TMeta;
};

export type GetTeamStylesMeta = {
  cursor: any;
  styles: any[];
};

export type GetStyleMeta = any;

type GetFileParams = {
  version?: string;
  ids?: string;
  depth?: number;
};

export class FigmaClient {
  constructor(readonly options: FigmaClientOptions) {}

  getTeamStyles(teamId: string): Promise<FigmaResponse<GetTeamStylesMeta>> {
    return this._request(`/teams/${teamId}/styles`);
  }

  getStyle(styleId: string): Promise<FigmaResponse<GetStyleMeta>> {
    return this._request(`/styles/${styleId}`);
  }

  getFile(styleId: string, params: GetFileParams = {}): Promise<any> {
    return this._request(`/files/${styleId}`, params);
  }

  private async _request(pathname: string, queryParams?: any) {
    let url = `https://api.figma.com/v1${pathname}`;

    if (queryParams) {
      url += "?" + querystring.stringify(queryParams);
    }

    const headers = {
      "X-Figma-Token": this.options.personalAccessToken
    };

    const response = await request({
      url,
      headers
    });

    return response.data;
  }
}
