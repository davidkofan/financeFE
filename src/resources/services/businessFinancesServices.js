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

export async function listFinancialYearOverview() {
  try {
    const response = await api.get(`/api/FinancialYears/overview/full`);
    return response.data;
  } catch (error) {
    console.error("Error listing financial years overview:", error);
    throw error;
  }
}

export async function listFinancialYear() {
  try {
    const response = await api.get(`/api/FinancialYears`);
    return response.data;
  } catch (error) {
    console.error("Error listing acount groups:", error);
    throw error;
  }
}

export async function createFinancialYear(data) {
  const alertStore = useAlertStore()
  try {
    const response = await api.post(`/api/FinancialYears`, data);

    alertStore.addAlert('success', 'Finančný rok bol úspešne vytvorený')

    return response.data;
  } catch (error) {
    alertStore.addAlert('danger', 'Chyba pri vytváraní finančného roku')

    throw error;
  }
}

export async function updateFinancialYear(id, data) {
  const alertStore = useAlertStore()
  try {
    const response = await api.put(`/api/FinancialYears/` + id, data);

    alertStore.addAlert('success', 'Finančný rok bol úspešne upravený')

    return response.data;
  } catch (error) {
    alertStore.addAlert('danger', 'Chyba pri upravovaní finančného roku')

    throw error;
  }
}

export async function deleteFinancialYear(id) {
  const alertStore = useAlertStore()
  try {
    const response = await api.delete(`/api/FinancialYears/` + id);

    alertStore.addAlert('success', 'Finančný rok bol úspešne vymazaný')

    return response.data;
  } catch (error) {
    alertStore.addAlert('danger', 'Chyba pri vymazávaní finančného roku')
    throw error;
  }
}

export async function listMonthlyBalance(finaicialYearId) {
  try {
    const response = await api.get(`/api/MonthlyBalances/` + finaicialYearId);
    return response.data;
  } catch (error) {
    console.error("Error listing monthly balances:", error);
    throw error;
  }
}

export async function createMonthlyBalance(data) {
  const alertStore = useAlertStore()
  try {
    const response = await api.post(`/api/MonthlyBalances`, data);

    alertStore.addAlert('success', 'Mesačný prehľad bol úspešne vytvorený')

    return response.data;
  } catch (error) {
    alertStore.addAlert('danger', 'Chyba pri vytváraní mesačného prehľadu')
    throw error;
  }
}

export async function updateMonthlyBalance(id, data) {
  const alertStore = useAlertStore()
  try {
    const response = await api.put(`/api/MonthlyBalances/` + id, data);

    alertStore.addAlert('success', 'Mesačný prehľad bol úspešne upravený')

    return response.data;
  } catch (error) {
    alertStore.addAlert('danger', 'Chyba pri upravovaní mesačného prehľadu')
    throw error;
  }
}

export async function deleteMonthlyBalance(id) {
  const alertStore = useAlertStore()
  try {
    const response = await api.delete(`/api/MonthlyBalances/` + id);

    alertStore.addAlert('success', 'Mesačný prehľad bol úspešne vymazaný')

    return response.data;
  } catch (error) {
    alertStore.addAlert('danger', 'Chyba pri vymazávaní mesačného prehľadu')
    throw error;
  }
}
