const axios = require('axios');
import { API_URL } from '../config.js'

export function createUser(name) {
  return axios.post(`${API_URL}/users`, { name });
}
