<script setup>
  import { useRouter, useRoute } from 'vue-router';
  import Logout from '@/components/login/LogoutComponent.vue';
</script>

<template>
  <div class="d-flex justify-content-between bg-dark text-white shadow p-2">
    <h4 class="mt-1 ms-1">Finančný portál</h4>
    <div>
      <BButtonGroup>
        <BButton @click="goToAdmin">Administrácia</BButton>
        <Logout></Logout>
      </BButtonGroup>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        router: useRouter(),
        route: useRoute(),
      }
    },
    methods: {
      goToAdmin() {
        this.router.push('/admin/accountGroups');
      },
      isActive(path) {
        return this.route.path === path;
      },
    },
  }
</script>
