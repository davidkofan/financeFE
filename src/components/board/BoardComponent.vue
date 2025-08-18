<script setup>
  import { ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  import NavMenu from '@/components/board/MenuComponent.vue';

  // Router
  const route = useRoute()
  const router = useRouter()

  // Zoznam tabov a mapovanie na indexy
  const routeToIndex = { accountGroups: 0, business: 1 }
  const indexToRoute = ['accountGroups', 'business']

  // Aktívny tab (index)
  const activeTab = ref(routeToIndex[route.path.split('/').pop()] ?? 0)

  // Synchronizácia index -> router
  watch(activeTab, (newIndex) => {
    const newTab = indexToRoute[newIndex]
    if (route.path.split('/').pop() !== newTab) {
      router.push(`/board/${newTab}`)
    }
  })

  // Synchronizácia router -> index
  watch(route, (r) => {
    const last = r.path.split('/').pop()
    activeTab.value = routeToIndex[last] ?? 0
  })
</script>

<template>
  <div class="wide">
    <NavMenu />

    <BCard no-body>
      <BTabs card v-model="activeTab">
        <BTab title="Stavy účtov" key="accountGroups">
          <router-view v-if="activeTab === 0" />
        </BTab>
        <BTab title="Živnosť" key="business" disabled>
          <router-view v-if="activeTab === 1" />
        </BTab>
      </BTabs>
    </BCard>
  </div>
</template>
