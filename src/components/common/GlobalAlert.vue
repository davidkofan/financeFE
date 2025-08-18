<template>
  <div class="position-fixed top-5 end-0 p-3" style="z-index: 1000;">
    <div v-for="alert in alerts" :key="alert.id" class="mb-2">
      <b-alert :variant="alert.type"
              :model-value="true"
              dismissible
              @closed="removeAlert(alert.id)">
        {{ alert.message }}
      </b-alert>
    </div>
  </div>
</template>

<script setup>
  import { storeToRefs } from 'pinia'
  import { useAlertStore } from '@/stores/alertStore'

  const alertStore = useAlertStore()
  const { alerts } = storeToRefs(alertStore)
  const { removeAlert } = alertStore
</script>
