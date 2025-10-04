import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // 🔁 à adapter selon ton port Laravel
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false, // passe à true si tu utilises des cookies
});

export default api;
