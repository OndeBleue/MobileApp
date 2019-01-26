const axios = require('axios');
import { API_URL } from '../config.js';
import { restoreIdentifier } from '../storage';

export function getCurrentUser() {
  const identifier = restoreIdentifier();
  const b64 = btoa(`${identifier}:password`);

  return axios.get(`${API_URL}/users/${identifier}`, {
    headers: {'Authorization': `Basic ${b64}`},
  });
}

export function updateUser(id, etag, name) {
  const identifier = restoreIdentifier();
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
