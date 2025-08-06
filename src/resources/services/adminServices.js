import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Vytvoríme api inštanciu bez tokenu
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Pridáme interceptor na každý požiadavok, ktorý automaticky pridá token z sessionStorage
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("userToken");
    if (token) {
      //config.headers['Authorization'] = `Bearer ${token}`; // Pridáme token do Authorization hlavičky
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Pridáme response interceptor na spracovanie chýb
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      sessionStorage.removeItem("userToken");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export async function listAccountGroupOverview() {
  try {
    const response = await api.get(`/api/AccountGroups/overview/full`);
    return response.data;
  } catch (error) {
    console.error("Error listing acount groups overview:", error);
    throw error;
  }
}

export async function listAccountGroup() {
  try {
    const response = await api.get(`/api/AccountGroups`);
    return response.data;
  } catch (error) {
    console.error("Error listing acount groups:", error);
    throw error;
  }
}

export async function createAccountGroup(data) {
  try {
    const response = await api.post(`/api/AccountGroups`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating acount groups:", error);
    throw error;
  }
}

export async function updateAccountGroup(id, data) {
  try {
    const response = await api.put(`/api/AccountGroups/` + id, data);
    return response.data;
  } catch (error) {
    console.error("Error updating acount groups:", error);
    throw error;
  }
}

export async function listAccount(filters) {
  try {
    const params = new URLSearchParams();
    if (filters.groupId) params.append('groupId', filters.groupId);

    const queryString = params.toString();
    const url = `/api/Accounts${queryString ? '?' + queryString : ''}`;

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Error listing acounts:", error);
    throw error;
  }
}

export async function createAccount(data) {
  try {
    const response = await api.post(`/api/Accounts`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating acounts:", error);
    throw error;
  }
}

export async function updateAccount(id, data) {
  try {
    const response = await api.put(`/api/Accounts/` + id, data);
    return response.data;
  } catch (error) {
    console.error("Error updating acounts:", error);
    throw error;
  }
}

export async function listBalance(accountId) {
  try {
    const response = await api.get(`/api/Balances/` + accountId);
    return response.data;
  } catch (error) {
    console.error("Error listing balances:", error);
    throw error;
  }
}

export async function createBalance(data) {
  try {
    const response = await api.post(`/api/Balances`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating balances:", error);
    throw error;
  }
}

export async function updateBalance(id, data) {
  try {
    const response = await api.put(`/api/Balances` + id, data);
    return response.data;
  } catch (error) {
    console.error("Error updating balances:", error);
    throw error;
  }
}
