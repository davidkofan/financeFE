<script setup>
  import { listExpenseGroupOverview, listIncomeGroupOverview } from '@/resources/services/expensesAndIncomeServices';
  import { Doughnut } from 'vue-chartjs';
  import ChartJS from 'chart.js/auto';
  import { ArcElement, Title, Tooltip, Legend } from 'chart.js';
  ChartJS.register(ArcElement, Title, Tooltip, Legend);
</script>

<template>
  <!-- STATE: loaded -->
  <template v-if="state === 'loaded'">

    <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-2">
      <BButton variant="primary" @click="refreshData" class="mb-2 mb-sm-0">🔄 Obnoviť dáta</BButton>
      <div v-if="lastUpdated" class="text-muted small">
        Naposledy aktualizované: {{ lastUpdated }}
      </div>
    </div>

    <!-- Výdavky sumár -->
    <b-row class="mb-2">
      <b-col cols="12" md="3" v-for="(group, index) in expenseGroupsActuals" :key="'exp-card-' + index">
        <b-card bg-variant="danger" text-variant="white" :header="group.name" class="text-center mb-2">
          <b-card-text>
            <h3>{{ financeFormatter(group.value) }}</h3>
          </b-card-text>
        </b-card>
      </b-col>
    </b-row>

    <!-- Príjmy sumár -->
    <b-row class="mb-2">
      <b-col cols="12" md="3" v-for="(group, index) in incomeGroupsActuals" :key="'inc-card-' + index">
        <b-card bg-variant="success" text-variant="white" :header="group.name" class="text-center mb-2">
          <b-card-text>
            <h3>{{ financeFormatter(group.value) }}</h3>
          </b-card-text>
        </b-card>
      </b-col>
    </b-row>

    <div class="border border-1 w-100 my-3"></div>

    <!-- Výdavky -->
    <h3>Výdavky</h3>
    <b-row>
      <b-col cols="12" md="6" v-for="(group, index) in expensesData" :key="'exp-' + index">
        <b-row class="my-2">
          <b-col cols="12" md="6">
            <h4>{{ group.name }}</h4>
            <b-table striped hover head-variant="dark"
                     :items="group.expenses"
                     :fields="fields"
                     responsive
                     foot-clone
                     tfoot-tr-class="table-success">
              <template #foot(name)>
                <strong>Celkom</strong>
              </template>
              <template #foot(amount)>
                <strong>{{ financeFormatter(sumGroup(group.expenses)) }}</strong>
              </template>
            </b-table>
          </b-col>
          <b-col cols="12" md="6" class="mt-2">
            <Doughnut :data="buildPieChartData(group, 'expenses')" :options="chartOptions" class="h-100" />
          </b-col>
        </b-row>
      </b-col>
    </b-row>

    <div class="border border-1 w-100 my-3"></div>

    <!-- Príjmy -->
    <h3>Príjmy</h3>
    <b-row>
      <b-col cols="12" md="6" v-for="(group, index) in incomesData" :key="'inc-' + index">
        <b-row class="my-2">
          <b-col cols="12" md="6">
            <h4>{{ group.name }}</h4>
            <b-table striped hover head-variant="dark"
                     :items="group.incomes"
                     :fields="fields"
                     responsive
                     foot-clone
                     tfoot-tr-class="table-success">
              <template #foot(name)>
                <strong>Celkom</strong>
              </template>
              <template #foot(amount)>
                <strong>{{ financeFormatter(sumGroup(group.incomes)) }}</strong>
              </template>
            </b-table>
          </b-col>
          <b-col cols="12" md="6" class="mt-2">
            <Doughnut :data="buildPieChartData(group, 'incomes')" :options="chartOptions" class="h-100" />
          </b-col>
        </b-row>
      </b-col>
    </b-row>
  </template>

  <!-- STATE: unloaded -->
  <template v-else-if="state === 'unloaded'">
    <div class="d-grid justify-content-center my-5">
      <b-spinner label="Načítavanie..."></b-spinner>
    </div>
  </template>

  <!-- STATE: error -->
  <template v-else-if="state === 'error'">
    <h2 class="mt-4">
      <b-badge variant="danger">Nastala neočakávaná chyba systému</b-badge>
    </h2>
  </template>
</template>

<script>
  export default {
    data() {
      return {
        state: 'unloaded',
        refreshing: false,
        expensesData: [],
        incomesData: [],
        expenseGroupsActuals: [],
        incomeGroupsActuals: [],
        cacheKey: 'financeOverviewCache',
        lastUpdated: null,
        chartOptions: { responsive: true, plugins: { legend: { position: 'bottom' } } },
        financeFormatter: (val) =>
          val != null
            ? `${Number(val).toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
            : '-',
        fields: [
          { key: 'name', label: 'Názov', class: 'text-center' },
          {
            key: 'amount',
            label: 'Suma',
            formatter: (val) =>
              `${Number(val).toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`,
            class: 'text-center',
          },
        ],
      };
    },
    mounted() {
      this.loadFromLocalStorage();
    },
    methods: {
      /** Načíta z localStorage alebo zo služby */
      async loadFromLocalStorage() {
        const cached = localStorage.getItem(this.cacheKey);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            this.expensesData = parsed.expensesData || [];
            this.incomesData = parsed.incomesData || [];
            this.lastUpdated = parsed.updatedAt ? new Date(parsed.updatedAt).toLocaleString('sk-SK') : null;
            this.prepareSummaries();
            this.state = 'loaded';
            return;
          } catch (e) {
            console.warn('Chybný JSON v localStorage');
          }
        }
        this.refreshData();
      },

      /** Refresh zo služby + uloženie do localStorage */
      async refreshData() {
        this.state = 'unloaded';
        this.refreshing = true;
        try {
          const [expensesResponse, incomesResponse] = await Promise.all([
            listExpenseGroupOverview(),
            listIncomeGroupOverview(),
          ]);
          this.expensesData = expensesResponse;
          this.incomesData = incomesResponse;
          this.prepareSummaries();
          this.state = 'loaded';
          this.lastUpdated = new Date().toLocaleString('sk-SK');
          localStorage.setItem(
            this.cacheKey,
            JSON.stringify({
              expensesData: expensesResponse,
              incomesData: incomesResponse,
              updatedAt: new Date().toISOString(),
            })
          );
        } catch (e) {
          console.error('Chyba pri načítaní dát:', e);
          this.state = 'error';
        } finally {
          this.refreshing = false;
        }
      },

      /** Priprava sumárnych kariet */
      prepareSummaries() {
        this.expenseGroupsActuals = this.expensesData.map((g) => ({ name: g.name, value: this.sumGroup(g.expenses) }));
        this.incomeGroupsActuals = this.incomesData.map((g) => ({ name: g.name, value: this.sumGroup(g.incomes) }));
      },

      sumGroup(data) {
        return data.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      },

      buildPieChartData(groupData, prop) {
        return {
          labels: groupData[prop].map((e) => e.name),
          datasets: [
            {
              label: groupData.name,
              data: groupData[prop].map((e) => e.amount),
              backgroundColor: [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#2ECC71', '#000000',
              ],
            },
          ],
        };
      },
    },
  };
</script>
