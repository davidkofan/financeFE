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

// Pridáme interceptor na každý požiadavok, ktorý automaticky pridá token z localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("userToken");
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
      localStorage.removeItem("userToken");
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
  const alertStore = useAlertStore()
  try {
    const response = await api.post(`/api/AccountGroups`, data);

    alertStore.addAlert('success', 'Skupina účtov bola úspešne vytvorená')

    return response.data;
  } catch (error) {
    alertStore.addAlert('danger', 'Chyba pri vytváraní skupiny účtov')

    throw error;
  }
}

export async function updateAccountGroup(id, data) {
  const alertStore = useAlertStore()
  try {
    const response = await api.put(`/api/AccountGroups/` + id, data);

    alertStore.addAlert('success', 'Skupina účtov bola úspešne upravená')

    return response.data;
  } catch (error) {
    alertStore.addAlert('danger', 'Chyba pri upravovaní skupiny účtov')

    throw error;
  }
}

export async function deleteAccountGroup(id) {
  const alertStore = useAlertStore()
  try {
    const response = await api.delete(`/api/AccountGroups/` + id);

    alertStore.addAlert('success', 'Skupina účtov bola úspešne vymazaná')

    return response.data;
  } catch (error) {
    alertStore.addAlert('danger', 'Chyba pri vymazávaní skupiny účtov')
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
  const alertStore = useAlertStore()
  try {
    const response = await api.post(`/api/Accounts`, data);

    alertStore.addAlert('success', 'Účet bol úspešne vytvorený')

    return response.data;
  } catch (error) {
    alertStore.addAlert('danger', 'Chyba pri vytváraní účtu')
    throw error;
  }
}

export async function updateAccount(id, data) {
  const alertStore = useAlertStore()
  try {
    const response = await api.put(`/api/Accounts/` + id, data);

    alertStore.addAlert('success', 'Účet bol úspešne upravený')

    return response.data;
  } catch (error) {
    alertStore.addAlert('danger', 'Chyba pri upravovaní účtu')
    throw error;
  }
}
export async function deleteAccount(id) {
  const alertStore = useAlertStore()
  try {
    const response = await api.delete(`/api/Accounts/` + id);

    alertStore.addAlert('success', 'Účet bol úspešne vymazaný')

    return response.data;
  } catch (error) {
    alertStore.addAlert('danger', 'Chyba pri vymazávaní účtu')
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
  const alertStore = useAlertStore()
  try {
    const response = await api.post(`/api/Balances`, data);

    alertStore.addAlert('success', 'Stav účtu bol úspešne vytvorený')

    return response.data;
  } catch (error) {
    alertStore.addAlert('danger', 'Chyba pri vytváraní stavu účtu')
    throw error;
  }
}

export async function updateBalance(id, data) {
  const alertStore = useAlertStore()
  try {
    const response = await api.put(`/api/Balances/` + id, data);

    alertStore.addAlert('success', 'Stav účtu bol úspešne upravený')

    return response.data;
  } catch (error) {
    alertStore.addAlert('danger', 'Chyba pri upravovaní stavu účtu')
    throw error;
  }
}

export async function deleteBalance(id) {
  const alertStore = useAlertStore()
  try {
    const response = await api.delete(`/api/Balances/` + id);

    alertStore.addAlert('success', 'Stav účtu bol úspešne vymazaný')

    return response.data;
  } catch (error) {
    alertStore.addAlert('danger', 'Chyba pri vymazávaní stavu účtu')
    throw error;
  }
}


export async function listExpetedIncrease(accountId) {
  try {
    const response = await api.get(`/api/ExpectedIncreases/` + accountId);
    return response.data;
  } catch (error) {
    console.error("Error listing ExpectedIncreases:", error);
    throw error;
  }
}

export async function createExpetedIncrease(data) {
  const alertStore = useAlertStore()
  try {
    const response = await api.post(`/api/ExpectedIncreases`, data);

    alertStore.addAlert('success', 'Predpokladaný príjem bol úspešne vytvorený')

    return response.data;
  } catch (error) {
    alertStore.addAlert('danger', 'Chyba pri vytváraní predpokladaného príjmu')
    throw error;
  }
}

export async function updateExpetedIncrease(id, data) {
  const alertStore = useAlertStore()
  try {
    const response = await api.put(`/api/ExpectedIncreases/` + id, data);

    alertStore.addAlert('success', 'Predpokladaný príjem bol úspešne upravený')

    return response.data;
  } catch (error) {
    alertStore.addAlert('danger', 'Chyba pri upravovaní predpokladaného príjmu')
    throw error;
  }
}

export async function deleteExpetedIncrease(id) {
  const alertStore = useAlertStore()
  try {
    const response = await api.delete(`/api/ExpectedIncreases/` + id);

    alertStore.addAlert('success', 'Predpokladaný príjem bol úspešne vymazaný')

    return response.data;
  } catch (error) {
    alertStore.addAlert('danger', 'Chyba pri vymazávaní predpokladaného príjmu')
    throw error;
  }
}
