import axios from 'axios';
import { API_URL } from '../config.js';

export function createUser(name) {
  return axios.post(`${API_URL}/users`, { name });
}

export function login(identifier) {
  if (parseInt(identifier, 10).length > 0) throw new Error(`L'identifiant fourni (${identifier}) est invalide.`);
  const b64 = btoa(`${identifier}:password`);

  return axios.get(`${API_URL}/users/${identifier}`, {
    headers: {'Authorization': `Basic ${b64}`},
  });
}
