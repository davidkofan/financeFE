import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_BASE_URL + 'auth';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("userToken");
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export async function loginUser(username, password) {
  try {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    sessionStorage.setItem('userToken', data.token);
    sessionStorage.setItem('username', data.userData.username);
    sessionStorage.setItem('readOnlyMode', data.userData.readOnlyMode);

    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export function logoutUser() {
  sessionStorage.removeItem('userToken');
}

export async function isAuthenticated() {
  const token = sessionStorage.getItem('userToken');
  if (!token) return false;

  try {
    const res = await api.get('/validate-token');
    if (res.status === 200) return true;
    return false;
  } catch (error) {
    console.log(error);
    sessionStorage.removeItem('userToken');
    return false;
  }
}
