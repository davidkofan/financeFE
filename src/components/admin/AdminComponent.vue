<script setup>
  import { ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  import NavMenu from '@/components/admin/MenuComponent.vue'
  import GlobalAlert from '@/components/common/GlobalAlert.vue'

  // Router
  const route = useRoute()
  const router = useRouter()

  // Zoznam tabov a mapovanie na indexy
  const routeToIndex = { accountGroups: 0, business: 1, expensesAndIncome: 2, 'import-export': 3 }
  const indexToRoute = ['accountGroups', 'business', 'expensesAndIncome', 'import-export']

  // Aktívny tab (index)
  const activeTab = ref(routeToIndex[route.path.split('/')[2]] ?? 0)

  // Synchronizácia index -> router
  watch(activeTab, (newIndex) => {
    const newTab = indexToRoute[newIndex]
    if (!newTab) return // ak neexistuje (napr. fiscalYearDetail), nerob nič
    if (route.path.split('/').pop() !== newTab) {
      router.push(`/admin/${newTab}`)
    }
  })

  // Synchronizácia router -> index
  watch(route, (r) => {
    const last = r.path.split('/').pop()
    activeTab.value = routeToIndex[last] ?? activeTab.value
  })
</script>

<template>
  <NavMenu />
  <GlobalAlert />

  <BCard no-body>
    <BTabs card v-model="activeTab">
      <BTab title="Stavy účtov" key="accountGroups">
        <router-view v-if="activeTab === 0" />
      </BTab>
      <BTab title="Živnosť" key="business">
        <router-view v-if="activeTab === 1" />
      </BTab>
      <BTab title="Výdavky a príjmy" key="expensesAndIncome">
        <router-view v-if="activeTab === 2" />
      </BTab>
      <BTab title="Správa dát" key="import-export">
        <router-view v-if="activeTab === 3" />
      </BTab>
    </BTabs>
  </BCard>
</template>
