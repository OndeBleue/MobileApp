import axios from 'axios';
import { API_URL } from '../config.js';
import Storage from '../storage';

const storage = new Storage();

export function saveError(error) {
  const ua = window.navigator.userAgent;
  return axios.post(`${API_URL}/errors`, { user: storage.id, data: JSON.stringify(error), 'user-agent': ua });
}
