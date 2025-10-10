<script setup>
  import { listFinancialYearOverview } from '@/resources/services/businessFinancesServices';

  import { Line } from 'vue-chartjs';
  import ChartJS from 'chart.js/auto';
  import { CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
  ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);
</script>

<template>
  <!--STATE  loaded-->
  <template v-if="state == 'loaded'">

    <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-2">
      <BButton variant="primary" @click="refreshData" class="mb-2 mb-sm-0">🔄 Obnoviť dáta</BButton>
      <div v-if="lastUpdated" class="text-muted small">
        Naposledy aktualizované: {{ lastUpdated }}
      </div>
    </div>


    <b-row class="mb-2">
      <b-col cols="12" md="3" v-for="(year, index) in summaryData" :key="index">
        <b-card :bg-variant="year.assumption ? 'danger' :'success'"
                text-variant="white"
                :header="year.year"
                class="text-center mb-2">
          <b-card-text>
            <h3>{{financeFormatter(year.income) }}</h3>
          </b-card-text>
        </b-card>
      </b-col>
    </b-row>

    <BTable striped hover head-variant="dark" :items="summaryData" :fields="summaryTableFields" responsive :tbody-tr-class="summaryRowClass">
      <template #cell(year)="data">
        <strong>{{ data.value }}</strong>
      </template>
    </BTable>

    <div class="border border-1 w-100 my-2"></div>

    <BRow class="mb-5">
      <BCol cols="12" md="6">
        <h5>Ročné príjmy</h5>
        <Line :data="buildSummaryIncomeChartData()" :options="chartOptions" class="h-100" />
      </BCol>
      <BCol cols="12" md="6" class="mt-5 mt-md-0">
        <h5>Ročné výdavky</h5>
        <Line :data="buildSummaryExpenseChartData()" :options="chartOptions" class="h-100" />
      </BCol>
    </BRow>

    <BRow class="my-5">
      <BCol cols="12" md="6">
        <h5>Mesačné príjmy</h5>
        <Line :data="buildMonthlyIncomeChartData()" :options="chartOptions" class="h-100" />
      </BCol>
      <BCol cols="12" md="6" class="mt-5 mt-md-0">
        <h5>Mesačné výdavky</h5>
        <Line :data="buildMonthlyExpenseChartData()" :options="chartOptions" class="h-100" />
      </BCol>
    </BRow>

    <div class="border border-1 w-100 my-2"></div>

    <div v-for="(financialYear, index) in financialYears" :key="index">

      <h4>Fiškálny rok {{ financialYear.financialYear.name }}</h4>
      <div class="mb-1">{{financialYear.financialYear.description}}</div>

      <BTable striped hover head-variant="dark" :items="financialYear.monthlyBalances" :fields="fields" responsive :tbody-tr-class="rowClass">
        <template #cell()="data">
          <span :class="data.item.total ? 'fw-bold' : ''">{{ data.value }}</span>
        </template>

        <template #cell(income)="data">
          <span :class="data.item.incomeAssumption ? 'text-danger fw-bold' : ''">{{ data.value }}</span>
        </template>

        <template #cell(healthInsurance)="data">
          <span :class="data.item.healthInsuranceAssumption ? 'text-danger fw-bold' : ''">{{ data.value }}</span>
        </template>

        <template #cell(socialInsurance)="data">
          <span :class="data.item.socialInsuranceAssumption ? 'text-danger fw-bold' : ''">{{ data.value }}</span>
        </template>

        <template #cell(tax)="data">
          <span :class="data.item.taxAssumption ? 'text-danger fw-bold' : ''">{{ data.value }}</span>
        </template>
      </BTable>
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
        financialYears: [],
        summaryData: [],
        lastUpdated: null,
        chartOptions: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top'
            }
          }
        },
        financeFormatter: (value) =>
          value != null
            ? `${Number(value).toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
            : '-',
        summaryTableFields: [
          {
            key: 'year',
            label: 'Rok',
            class: 'text-center'
          },
          {
            key: 'numberOfMonths',
            label: 'Počet mesiacov',
            class: 'text-center'
          },
          {
            key: 'income',
            label: 'Príjem (rok)',
            formatter: (val) => this.financeFormatter(val),
            class: 'text-center'
          },
          {
            key: 'incomePerMonth',
            label: 'Príjem (mesačný priemer)',
            formatter: (val) => this.financeFormatter(val),
            class: 'text-center'
          },
          {
            key: 'healthInsurance',
            label: 'Zdravotné poistenie',
            formatter: (val) => this.financeFormatter(val),
            class: 'text-center'
          },
          {
            key: 'socialInsurance',
            label: 'Sociálne poistenie',
            formatter: (val) => this.financeFormatter(val),
            class: 'text-center'
          },
          {
            key: 'tax',
            label: 'Daň',
            formatter: (val) => this.financeFormatter(val),
            class: 'text-center'
          },
          {
            key: 'profit',
            label: 'Zisk (rok)',
            formatter: (val) => this.financeFormatter(val),
            class: 'text-center'
          },
          {
            key: 'profitPerMonth',
            label: 'Zisk (mesačný priemer)',
            formatter: (val) => this.financeFormatter(val),
            class: 'text-center'
          },
        ],
        fields: [
          {
            key: 'month',
            label: 'Mesiac',
            formatter: (val) => this.monthOptions.find(month => month.value == val)?.text ?? val,
            class: 'text-center'
          },
          {
            key: 'income',
            label: 'Príjem',
            formatter: (val) => this.financeFormatter(val),
            class: 'text-center'
          },
          {
            key: 'healthInsurance',
            label: 'Zdravotné poistenie',
            formatter: (val) => this.financeFormatter(val),
            class: 'text-center'
          },
          {
            key: 'socialInsurance',
            label: 'Sociálne poistenie',
            formatter: (val) => this.financeFormatter(val),
            class: 'text-center'
          },
          {
            key: 'tax',
            label: 'Daň',
            formatter: (val) => this.financeFormatter(val),
            class: 'text-center'
          },
        ],
        monthOptions: [
          { value: '1', text: '1 - Január' },
          { value: '2', text: '2 - Február' },
          { value: '3', text: '3 - Marec' },
          { value: '4', text: '4 - Apríl' },
          { value: '5', text: '5 - Máj' },
          { value: '6', text: '6 - Jún' },
          { value: '7', text: '7 - Júl' },
          { value: '8', text: '8 - August' },
          { value: '9', text: '9 - September' },
          { value: '10', text: '10 - Október' },
          { value: '11', text: '11 - November' },
          { value: '12', text: '12 - December' }
        ],
      };
    },
    mounted() {
      this.loadFromCacheOrFetch();
    },
    methods: {
      loadFromCacheOrFetch() {
        const cachedData = localStorage.getItem('financialOverview');
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          this.financialYears = parsed.financialYears;
          this.summaryData = parsed.summaryData;
          this.lastUpdated = parsed.lastUpdated;
          this.state = 'loaded';
        } else {
          this.fetchFreshData();
        }
      },

      fetchFreshData() {
        this.state = 'unloaded';
        listFinancialYearOverview()
          .then((response) => {
            const summaryData = [];
            for (let financialYear of response) {
              financialYear.monthlyBalances.push({
                month: 'Doplatky',
                tax: financialYear.financialYear.additionalTax,
                healthInsurance: financialYear.financialYear.additionalHealthInsurance,
                socialInsurance: financialYear.financialYear.additionalSocialInsurance,
                taxAssumption: financialYear.financialYear.additionalTaxAssumption,
                healthInsuranceAssumption: financialYear.financialYear.additionalHealthInsuranceAssumption,
                socialInsuranceAssumption: financialYear.financialYear.additionalSocialInsuranceAssumption,
                aditionals: true
              });
            }

            for (let financialYear of response) {
              const totals = financialYear.monthlyBalances.reduce((acc, item) => {
                acc.income += item.income || 0;
                acc.tax += item.tax || 0;
                acc.healthInsurance += item.healthInsurance || 0;
                acc.socialInsurance += item.socialInsurance || 0;
                return acc;
              }, { income: 0, tax: 0, healthInsurance: 0, socialInsurance: 0 });

              const numberOfMonths = financialYear.monthlyBalances.filter(m => !m.aditionals).length;
              const profit = totals.income - totals.tax - totals.healthInsurance - totals.socialInsurance;

              const totalObj = {
                month: 'Celkom',
                year: financialYear.financialYear.name,
                numberOfMonths,
                income: totals.income,
                incomePerMonth: totals.income / numberOfMonths,
                tax: totals.tax,
                healthInsurance: totals.healthInsurance,
                socialInsurance: totals.socialInsurance,
                profit,
                profitPerMonth: profit / numberOfMonths,
                incomeAssumption: financialYear.monthlyBalances.some(m => m.incomeAssumption),
                taxAssumption: financialYear.monthlyBalances.some(m => m.taxAssumption),
                healthInsuranceAssumption: financialYear.monthlyBalances.some(m => m.healthInsuranceAssumption),
                socialInsuranceAssumption: financialYear.monthlyBalances.some(m => m.socialInsuranceAssumption),
                total: true
              };

              totalObj.assumption =
                totalObj.incomeAssumption ||
                totalObj.taxAssumption ||
                totalObj.healthInsuranceAssumption ||
                totalObj.socialInsuranceAssumption;

              financialYear.monthlyBalances.push(totalObj);
              summaryData.push(totalObj);
            }

            this.financialYears = response;
            this.summaryData = summaryData;
            this.lastUpdated = new Date().toLocaleString('sk-SK');
            this.state = "loaded";

            // uloženie do localStorage
            localStorage.setItem('financialOverview', JSON.stringify({
              financialYears: this.financialYears,
              summaryData: this.summaryData,
              lastUpdated: this.lastUpdated
            }));
          })
          .catch(() => {
            this.state = "error";
          });
      },

      refreshData() {
        localStorage.removeItem('financialOverview');
        this.fetchFreshData();
      },

      summaryRowClass(row) {
        if (row.assumption) return 'table-danger';
        return 'table-success';
      },
      rowClass(row) {
        if (row.total) return 'table-success';
        else if (row.aditionals) return 'table-warning';
      },
      // MESACNE GRAFY
      buildMonthlyIncomeChartData() {
        const labels = [];
        const income = [];
        const profit = [];

        const sortedYears = [...this.financialYears].sort(
          (a, b) => a.financialYear.name - b.financialYear.name
        );

        for (const fy of sortedYears) {
          const sortedBalances = fy.monthlyBalances
            .filter(mb => !mb.total && !mb.aditionals && !isNaN(mb.month))
            .sort((a, b) => Number(a.month) - Number(b.month));

          for (const mb of sortedBalances) {
            labels.push(`${mb.month}/${fy.financialYear.name}`);
            income.push(mb.income ?? 0);
            profit.push(fy.monthlyBalances[fy.monthlyBalances.length - 1].profitPerMonth ?? 0);
          }

        }

        return {
          labels,
          datasets: [
            {
              label: 'Príjem',
              data: income,
              borderColor: 'green',
            },
            {
              label: 'Zisk (mesačný priemer)',
              data: profit,
              borderColor: 'blue',
            }
          ]
        };
      },

      buildMonthlyExpenseChartData() {
        const labels = [];
        const tax = [];
        const healthInsurance = [];
        const socialInsurance = [];

        const sortedYears = [...this.financialYears].sort(
          (a, b) => a.financialYear.name - b.financialYear.name
        );

        for (const fy of sortedYears) {
          const sortedBalances = fy.monthlyBalances
            .filter(mb => !mb.total && !mb.aditionals && !isNaN(mb.month))
            .sort((a, b) => Number(a.month) - Number(b.month));

          for (const mb of sortedBalances) {
            labels.push(`${mb.month}/${fy.financialYear.name}`);

            tax.push(fy.financialYear.additionalTax / sortedBalances.length);
            healthInsurance.push(mb.healthInsurance ?? 0);
            socialInsurance.push(mb.socialInsurance ?? 0);
          }
        }

        return {
          labels,
          datasets: [
            {
              label: 'Zdravotné poistenie',
              data: healthInsurance,
              borderColor: 'orange',
            },
            {
              label: 'Sociálne poistenie',
              data: socialInsurance,
              borderColor: 'purple',
            },
            {
              label: 'Daň (mesačný priemer)',
              data: tax,
              borderColor: 'red',
            },
          ]
        };
      },

      // SUMARNE GRAFY
      buildSummaryIncomeChartData() {
        const labels = this.summaryData.map(item => item.year);

        return {
          labels,
          datasets: [
            {
              label: 'Príjem',
              data: this.summaryData.map(item => item.income ?? 0),
              borderColor: 'green',
            },
            {
              label: 'Zisk',
              data: this.summaryData.map(item => item.profit ?? 0),
              borderColor: 'blue',
            }
          ]
        };
      },

      buildSummaryExpenseChartData() {
        const labels = this.summaryData.map(item => item.year);

        return {
          labels,
          datasets: [
            {
              label: 'Zdravotné poistenie',
              data: this.summaryData.map(item => item.healthInsurance ?? 0),
              borderColor: 'orange',
            },
            {
              label: 'Sociálne poistenie',
              data: this.summaryData.map(item => item.socialInsurance ?? 0),
              borderColor: 'purple',
            },
            {
              label: 'Daň',
              data: this.summaryData.map(item => item.tax ?? 0),
              borderColor: 'red',
            },
          ]
        };
      }
    },
  }
</script>
