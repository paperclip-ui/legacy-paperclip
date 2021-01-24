import { Project, ProjectFile } from "../state";
import mime from "mime-types";

export const connectAccount = async (kind: string, params: any) => {
  return await requestJSON(`/connect/${kind}`, {
    method: "POST",
    body: JSON.stringify(params)
  });
};

export const logout = async () => {
  return await requestJSON(`/session`, {
    method: "DELETE"
  });
};

export const createProject = async (
  name: string,
  files: Record<string, string>,
  mainFileUri?: string
) => {
  return await requestJSON(`/projects`, {
    method: "POST",
    body: JSON.stringify({
      files,
      name,
      mainFileUri
    })
  });
};

export const updateProjectFile = async (
  projectId: number,
  path: string,
  contents: string | Blob
) => {
  return await request(
    `/projects/${projectId}/files/${encodeURIComponent(path)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": mime.lookup(path) || "text/plain"
      },
      body: contents
    }
  );
};
export const updateRawProjectFile = async (
  projectId: number,
  file: File
): Promise<ProjectFile> => {
  return await requestJSON(
    `/projects/${projectId}/files?name=${encodeURIComponent(file.name)}`,
    {
      method: "POST",
      body: file
    }
  );
};

export const updateProjectFilePath = async (
  projectId: number,
  path: string,
  newPath: string
) => {
  return await request(
    `/projects/${projectId}/files/${encodeURIComponent(path)}`,
    {
      method: "PATCH",
      body: { uri: newPath }
    }
  );
};

export const updateProject = async (
  projectId: number,
  properties: Partial<{
    name: string;
    mainFileUri?: string;
  }>
) => {
  return await requestJSON(`/projects/${projectId}`, {
    method: "PATCH",
    body: JSON.stringify(properties)
  });
};

export const deleteProjectFile = async (projectId: number, path: string) => {
  return await request(
    `/projects/${projectId}/files/${encodeURIComponent(path)}`,
    {
      method: "DELETE"
    }
  );
};

export const getUser = async () => {
  return await requestJSON(`/session`);
};

export const getProject = async (projectId: string) => {
  return await requestJSON(`/projects/${projectId}`);
};
export const deleteProject = async (projectId: number) => {
  return await requestJSON(`/projects/${projectId}`, {
    method: "DELETE"
  });
};

export const getProjects = async () => {
  return await requestJSON(`/projects`);
};

const requestJSON = async (path: string, options: any = {}) => {
  const resp = await request(path, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await resp.json();

  if (resp.status !== 200) {
    throw data;
  }

  return data;
};

const request = async (path: string, options: any = {}) => {
  return await fetch(
    window.location.protocol + "//" + process.env.API_HOST + path,
    {
      ...options,
      credentials: "include"
    }
  );
};
