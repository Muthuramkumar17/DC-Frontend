import { apiFetch } from "@/services/http/client.js";
import { ApiError } from "@/services/http/errors.js";
import { getAuthToken, setAuthToken, logout } from "@/services/storage/authStorage.js";

export { getAuthToken, setAuthToken, logout };

export async function loginApi({ email, password }) {
  if (!email || !password) {
    throw new ApiError("Email and password are required", 400);
  }

  const result = await apiFetch("/login", {
    method: "POST",
    body: { email: email.trim(), password },
    skipAuth: true,
    skipLogout: true,
  });

  if (!result?.token) {
    throw new ApiError("Login succeeded but no access token was returned", 500);
  }

  setAuthToken(result.token);

  const { token, access_token, refresh_token, ...sanitizedResult } = result;
  return { success: true, ...sanitizedResult };
}

export async function getCurrentUserApi() {
  return apiFetch("/users/me");
}
