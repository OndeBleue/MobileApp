const uuidKey = "onde-bleue-app:user-uuid";
const idKey = "onde-bleue-app:user-identifier";
const tokenKey = "onde-bleue-app:user-token";

export function storeUser(user) {
  localStorage.setItem(uuidKey, user._id);
  localStorage.setItem(idKey, user.identifier);
  localStorage.setItem(tokenKey, user.token);
}

export function restoreIdentifier() {
  return localStorage.getItem(idKey);
}

export function restoreToken() {
  return localStorage.getItem(tokenKey);
}

export function restoreId() {
  return localStorage.getItem(uuidKey);
}

export function disconnect() {
  localStorage.removeItem(uuidKey);
  localStorage.removeItem(idKey);
  localStorage.removeItem(tokenKey);
}

export function isAuthenticated() {
  return !!restoreId() && !!restoreIdentifier() && !!restoreToken();
}
