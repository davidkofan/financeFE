<script setup>
  import { listExpenseGroupOverview, listIncomeGroupOverview } from '@/resources/services/expensesAndIncomeServices';

  import { Line, Pie, Doughnut } from 'vue-chartjs';
  import ChartJS from 'chart.js/auto';
  import { CategoryScale, LinearScale, ArcElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
  ChartJS.register(CategoryScale, LinearScale, ArcElement, LineElement, PointElement, Title, Tooltip, Legend);
</script>

<template>
  <!--STATE  loaded-->
  <template v-if="state == 'loaded'">

    <b-row class="my-2">
      <b-col cols="12" md="3" v-for="(expense,index) in expensesData" :key="index">
        <b-card bg-variant="danger"
                text-variant="white"
                :header="expense.name"
                class="text-center mb-2">
          <b-card-text>
            <h3>{{ financeFormatter(sumGroup(expense.expenses)) }}</h3>
          </b-card-text>
        </b-card>
      </b-col>
    </b-row>

    <b-row class="my-2">
      <b-col cols="12" md="3" v-for="(income,index) in incomesData" :key="index">
        <b-card bg-variant="success"
                text-variant="white"
                :header="income.name"
                class="text-center mb-2">
          <b-card-text>
            <h3>{{ financeFormatter(sumGroup(income.incomes)) }}</h3>
          </b-card-text>
        </b-card>
      </b-col>
    </b-row>

    <div class="border border-1 w-100 my-2"></div>

    <h3>Výdavky</h3>

    <BRow>
      <BCol cols="12" md="6" v-for="(groupData, index) in expensesData" :key="index">
        <BRow class="my-2">
          <BCol cols="12" md="6">
            <h4>{{groupData.name}}</h4>

            <BTable striped
                    hover
                    head-variant="dark"
                    :items="groupData.expenses"
                    :fields="fields"
                    responsive
                    foot-clone
                    tfoot-tr-class="table-success">
              <template #foot(name)>
                <strong>Celkom</strong>
              </template>
              <template #foot(amount)>
                <strong>{{ financeFormatter(sumGroup(groupData.expenses)) }}</strong>
              </template>
            </BTable>
          </BCol>

          <BCol cols="12" md="6" class="mt-2">
            <Doughnut :data="buildPieChartData(groupData, 'expenses')" :options="chartOptions" class="h-100" />
          </BCol>
        </BRow>
      </BCol>
    </BRow>

    <div class="border border-1 w-100 my-2"></div>

    <h3>Príjmy</h3>

    <BRow>
      <BCol cols="12" md="6" v-for="(groupData, index) in incomesData" :key="index">
        <BRow class="my-2">
          <BCol cols="12" md="6">
            <h4>{{groupData.name}}</h4>

            <BTable striped
                    hover
                    head-variant="dark"
                    :items="groupData.incomes"
                    :fields="fields"
                    responsive
                    foot-clone
                    tfoot-tr-class="table-success">
              <template #foot(name)>
                <strong>Celkom</strong>
              </template>
              <template #foot(amount)>
                <strong>{{ financeFormatter(sumGroup(groupData.incomes)) }}</strong>
              </template>
            </BTable>
          </BCol>

          <BCol cols="12" md="6" class="mt-2">
            <Doughnut :data="buildPieChartData(groupData, 'incomes')" :options="chartOptions" class="h-100" />
          </BCol>
        </BRow>
      </BCol>
    </BRow>

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
        incomesData: [],
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
        Promise.all([listExpenseGroupOverview(), listIncomeGroupOverview()])
          .then(([expensesResponse, incomesResponse]) => {
            this.expensesData = expensesResponse;
            this.incomesData = incomesResponse;
            this.state = "loaded";
          })
          .catch(() => {
            this.state = "error";
          });
      },
      buildPieChartData(groupData, prop) {
        return {
          labels: groupData[prop].map(e => e.name),
          datasets: [
            {
              label: 'Výdavky',
              data: groupData[prop].map(e => e.amount),
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
      sumGroup(data) {
        return data.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      }
    },
  }
</script>
