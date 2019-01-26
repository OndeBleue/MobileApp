const idKey = "onde-bleue-app:user-identifier";
const tokenKey = "onde-bleue-app:user-token";

export function storeUser(user) {
  localStorage.setItem(idKey, user.identifier);
  localStorage.setItem(tokenKey, user.token);
}

export function restoreIdentifier() {
  return localStorage.getItem(idKey);
}

export function restoreToken() {
  return localStorage.getItem(tokenKey);
}

export function isAuthenticated() {
  return !!restoreIdentifier() && !!restoreToken();
}
