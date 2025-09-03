import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

import { useAlertStore } from '@/stores/alertStore'

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

export async function listExpenseGroupOverview() {
  try {
    const response = await api.get(`/api/ExpenseGroups/overview/full`);
    return response.data;
  } catch (error) {
    console.error("Error listing expenses groups overview:", error);
    throw error;
  }
}

export async function listExpensesGroup() {
  try {
    const response = await api.get(`/api/ExpenseGroups`);
    return response.data;
  } catch (error) {
    console.error("Error listing expenses groups:", error);
    throw error;
  }
}

export async function createExpensesGroup(data) {
  const alertStore = useAlertStore()
  try {
    const response = await api.post(`/api/ExpenseGroups`, data);

    alertStore.addAlert('success', 'Skupina výdavkov bola úspešne vytvorená')

    return response.data;
  } catch (error) {
    alertStore.addAlert('danger', 'Chyba pri vytváraní skupiny výdavkov')

    throw error;
  }
}

export async function updateExpensesGroup(id, data) {
  const alertStore = useAlertStore()
  try {
    const response = await api.put(`/api/ExpenseGroups/` + id, data);

    alertStore.addAlert('success', 'Skupina výdavkov bola úspešne upravená')

    return response.data;
  } catch (error) {
    alertStore.addAlert('danger', 'Chyba pri upravovaní skupiny výdavkov')

    throw error;
  }
}

export async function deleteExpensesGroup(id) {
  const alertStore = useAlertStore()
  try {
    const response = await api.delete(`/api/ExpenseGroups/` + id);

    alertStore.addAlert('success', 'Skupina výdavkov bola úspešne vymazaná')

    return response.data;
  } catch (error) {
    alertStore.addAlert('danger', 'Chyba pri vymazávaní skupiny výdavkov')
    throw error;
  }
}

export async function listExpense(filters) {
  try {
    const params = new URLSearchParams();
    if (filters.groupId) params.append('groupId', filters.groupId);

    const queryString = params.toString();
    const url = `/api/expense${queryString ? '?' + queryString : ''}`;

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Error listing expense:", error);
    throw error;
  }
}

export async function createExpense(data) {
  const alertStore = useAlertStore()
  try {
    const response = await api.post(`/api/expense`, data);

    alertStore.addAlert('success', 'Výdavok bol úspešne vytvorený')

    return response.data;
  } catch (error) {
    alertStore.addAlert('danger', 'Chyba pri vytváraní výdavku')
    throw error;
  }
}

export async function updateExpense(id, data) {
  const alertStore = useAlertStore()
  try {
    const response = await api.put(`/api/expense/` + id, data);

    alertStore.addAlert('success', 'Výdavok bol úspešne upravený')

    return response.data;
  } catch (error) {
    alertStore.addAlert('danger', 'Chyba pri upravovaní výdavku')
    throw error;
  }
}
export async function deleteExpense(id) {
  const alertStore = useAlertStore()
  try {
    const response = await api.delete(`/api/expense/` + id);

    alertStore.addAlert('success', 'Výdavok bol úspešne vymazaný')

    return response.data;
  } catch (error) {
    alertStore.addAlert('danger', 'Chyba pri vymazávaní výdavku')
    throw error;
  }
}
