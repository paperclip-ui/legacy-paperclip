export const connectAccount = async (kind: string, params: any) => {
  return await request(`/connect/${kind}`, {
    method: "POST",
    body: JSON.stringify(params),
  });
};

export const logout = async () => {
  return await request(`/session`, {
    method: "DELETE",
  });
};

export const createProject = async (
  name: string,
  files: Record<string, string>
) => {
  return await request(`/projects`, {
    method: "POST",
    body: JSON.stringify({
      files,
      name,
    }),
  });
};

export const getUser = async () => {
  return await request(`/session`);
};

const request = async (path: string, options: any = {}) => {
  const resp = await fetch(
    window.location.protocol + "//" + process.env.API_HOST + path,
    {
      ...options,
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );
  const data = await resp.json();

  if (resp.status !== 200) {
    throw data;
  }

  return data;
};
