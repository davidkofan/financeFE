<script setup>
  import { listExpenseGroupOverview } from '@/resources/services/expensesAndIncomeServices';

  import { Line, Pie, Doughnut } from 'vue-chartjs';
  import ChartJS from 'chart.js/auto';
  import { CategoryScale, LinearScale, ArcElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
  ChartJS.register(CategoryScale, LinearScale, ArcElement, LineElement, PointElement, Title, Tooltip, Legend);
</script>

<template>
  <!--STATE  loaded-->
  <template v-if="state == 'loaded'">
    <h3 class="text-center">Výdavky</h3>

    <div v-for="(groupData, index) in expensesData" :key="index">
      <BRow class="my-2 d-flex justify-content-around">
        <BCol cols="12" sm="6" xl="7">
          <h5>{{groupData.name}}</h5>

          <BTable striped
                  hover
                  head-variant="dark"
                  :items="groupData.expenses"
                  :fields="fields"
                  responsive
                  foot-clone
                  tfoot-tr-class="table-secondary">
            <template #foot(name)>
              <strong>Spolu</strong>
            </template>
            <template #foot(amount)>
              <strong>{{ financeFormatter(sumGroup(groupData.expenses)) }}</strong>
            </template>
          </BTable>
        </BCol>

        <BCol cols="12" sm="5" xl="3" class="my-2">
          <Doughnut :data="buildPieChartData(groupData)" :options="chartOptions" class="h-100" />
        </BCol>
      </BRow>
    </div>
  </template>

  <!--STATE  unloaded-->
  <template v-else-if="state == 'unloaded'">
    <div class="d-grid justify-content-center my-5">
      <BSpinner label="Načítavanie..."></BSpinner>
    </div>
  </template>

  <!-- STATE  error-->
  <template v-else-if="state == 'error'">
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
        expensesData: [],
        chartOptions: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        },
        financeFormatter: (value) =>
          value != null
            ? `${Number(value).toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
            : '-',
        fields: [
          {
            key: 'name',
            label: 'Názov',
            class: 'text-center'
          },
          {
            key: 'amount',
            label: 'Výdavok',
            formatter: (val) => this.financeFormatter(val),
            class: 'text-center'
          },
        ],
      };
    },
    mounted() {
      this.loadData();
    },
    methods: {
      loadData() {
        listExpenseGroupOverview()
          .then((response) => {
            this.expensesData = response;
            this.state = "loaded";
          })
          .catch(() => {
            this.state = "error";
          });
      },
      buildPieChartData(groupData) {
        return {
          labels: groupData.expenses.map(e => e.name),
          datasets: [
            {
              label: 'Výdavky',
              data: groupData.expenses.map(e => e.amount),
              backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF',
                '#FF9F40',
                '#2ECC71',
                '#000000',
              ],
              borderWidth: 1,
            },
          ],
        };
      },
      sumGroup(expenses) {
        return expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      }
    },
  }
</script>
