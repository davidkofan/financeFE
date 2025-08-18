import { defineStore } from 'pinia'

export const useAlertStore = defineStore('alerts', {
  state: () => ({
    alerts: [] // { id, type, message }
  }),
  actions: {
    addAlert(type, message) {
      const id = Date.now() + Math.random()
      this.alerts.push({ id, type, message })

      // auto-close po 5 sekundách
      //setTimeout(() => this.removeAlert(id), 5000)
    },
    removeAlert(id) {
      console.log('Removing alert with id:', id)
      this.alerts = this.alerts.filter(a => a.id !== id)
    }
  }
})
