const AUTH_TOKEN_KEY = "auth_token";

export function getAuthToken() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY) || "";
  return token.trim() || null;
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

export function logout() {
  setAuthToken(null);
  localStorage.removeItem("tco_logged_out");
  sessionStorage.clear();
  window.dispatchEvent(new Event("auth_logout"));
}

