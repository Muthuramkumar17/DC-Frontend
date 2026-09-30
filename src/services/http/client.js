import api from "@/api/axios.js";
import { getAuthToken, logout } from "../storage/authStorage.js";
import { ApiError } from "./errors.js";

export { api as apiClient };

function isLoginRequest(config = {}) {
  const url = `${config.url || ""}`.split("?")[0].replace(/^\//, "");
  return url === "login" || url.endsWith("/login");
}

api.interceptors.request.use((config) => {
  if (config.skipAuth || isLoginRequest(config)) {
    return config;
  }

  const token = getAuthToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config?.skipLogout &&
      !isLoginRequest(error.config)
    ) {
      logout();
    }
    return Promise.reject(error);
  },
);

export function authHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function handleAxiosError(err, { skipLogout = false } = {}) {
  if (err.response) {
    const status = err.response.status;
    const data = err.response.data;
    const message = data?.message || `API request failed with status ${status}`;

    if (status === 401) {
      if (!skipLogout && !isLoginRequest(err.config)) {
        logout();
      }
      throw new ApiError(
        data?.message ||
          "Session expired or unauthorized. Please log in again.",
        401,
        data,
      );
    }

    throw new ApiError(message, status, data);
  }

  throw new ApiError(
    err.message || "Network error occurred. Please check your connection.",
    0,
  );
}

export async function apiFetch(endpoint, options = {}) {
  const path = endpoint.startsWith("http")
    ? endpoint
    : endpoint.replace(/^\/api\//, "").replace(/^\//, "");

  const { skipAuth = false, skipLogout = false } = options;
  const method = (options.method || "GET").toUpperCase();
  const headers = {
    ...(skipAuth ? {} : authHeaders()),
    ...options.headers,
  };
  const params = options.params || undefined;

  let data;
  if (options.body instanceof FormData) {
    data = options.body;
  } else if (typeof options.body === "string") {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
    try {
      data = JSON.parse(options.body);
    } catch {
      data = options.body;
    }
  } else if (options.body && typeof options.body === "object") {
    data = options.body;
  }

  try {
    let response;
    const requestConfig = { headers, params, skipAuth, skipLogout };

    if (method === "GET") {
      response = await api.get(path, requestConfig);
    } else if (method === "POST") {
      response = await api.post(path, data, requestConfig);
    } else if (method === "PUT") {
      response = await api.put(path, data, requestConfig);
    } else if (method === "PATCH") {
      response = await api.patch(path, data, requestConfig);
    } else if (method === "DELETE") {
      response = await api.delete(path, { ...requestConfig, data });
    } else {
      response = await api.request({
        method,
        url: path,
        data,
        ...requestConfig,
      });
    }

    return response.data ?? {};
  } catch (err) {
    handleAxiosError(err, { skipLogout });
  }
}
