<script setup>
  import { useRouter, useRoute } from 'vue-router';
</script>

<template>
  <b-nav tabs class="mx-1 mt-2">
    <b-nav-item @click="goToBoard" :active="isActive('/')">Prehľad</b-nav-item>
    <b-nav-item @click="goToAdmin" :active="isActive('/admin')">Administrácia</b-nav-item>
  </b-nav>
</template>

<script>
  export default {
    data() {
      return {
        router: useRouter(),
        route: useRoute(),
        menuOpen: false,
      }
    },
    methods: {
      goToBoard() {
        this.router.push('/');
        this.menuOpen = false;
      },
      goToAdmin() {
        this.router.push('/admin');
        this.menuOpen = false;
      },
      isActive(path) {
        return this.route.path === path;
      },
    },
  }
</script>
