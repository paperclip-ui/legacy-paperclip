import fetch from "node-fetch";

export const requestJSON = async (method: string, url: string, body?: any) => {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const result = await response.json();

  if (response.status !== 200) {
    throw result;
  }

  return result;
};

export const ok = (resolve, reject) => (err, result) => {
  if (err != null) {
    return reject(err);
  }
  return resolve(result);
};
