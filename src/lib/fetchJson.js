export default async function fetchJson(...args) {
  try {
    const argsWithBasePath = args;
    if (
      process.env.NEXT_PUBLIC_BASE_PATH &&
      args[0] &&
      typeof args[0] === 'string'
    ) {
      argsWithBasePath[0] = `${process.env.NEXT_PUBLIC_BASE_PATH}${args[0]}`;
    }
    const response = await fetch(...argsWithBasePath);

    // if the server replies, there's always some data in json
    // if there's a network error, it will throw at the previous line
    const data = await response.json();

    if (response.ok) {
      return data;
    }

    const error = new Error(data.message || response.statusText);
    error.response = response;
    error.data = data;
    throw error;
  } catch (error) {
    if (!error.data) {
      error.data = { message: error.message };
    }
    throw error;
  }
}
