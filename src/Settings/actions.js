import axios from 'axios';
import { API_URL } from '../config.js';
import Storage from '../storage';

const storage = new Storage();

export function getCurrentUser() {
  const identifier = storage.identifier;
  const b64 = btoa(`${identifier}:password`);

  return axios.get(`${API_URL}/users/${identifier}`, {
    headers: {'Authorization': `Basic ${b64}`},
  });
}

export function updateUser(id, etag, name) {
  const identifier = storage.identifier;
  const b64 = btoa(`${identifier}:password`);

  return axios.patch(`${API_URL}/users/${id}`, {
    name
  }, {
    headers: {
      'Authorization': `Basic ${b64}`,
      'If-Match': etag,
      'Content-Type': 'application/json',
    },
  });
}

export function deleteUser(id, etag) {
  const identifier = storage.identifier;
  const b64 = btoa(`${identifier}:password`);

  return axios.delete(`${API_URL}/users/${id}`, {
    headers: {
      'Authorization': `Basic ${b64}`,
      'If-Match': etag,
    },
  });
}
