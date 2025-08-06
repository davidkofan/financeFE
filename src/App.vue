<script setup>
  import { RouterView } from "vue-router";
  import NavMenu from '@/components/MenuComponent.vue';
</script>

<template>
  <main>
    <NavMenu></NavMenu>
    <div class="p-3">
      <router-view  />
    </div>
  </main>
</template>
