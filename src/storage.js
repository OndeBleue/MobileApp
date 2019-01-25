export function storeUser(user) {
  localStorage.setItem('identifier', user.identifier);
  localStorage.setItem('token', user.token);
}

export function restoreIdentifier() {
  return localStorage.getItem('identifier');
}

export function restoreToken() {
  return localStorage.getItem('token');
} 
