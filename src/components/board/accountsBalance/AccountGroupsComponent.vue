<script setup>
  import { listAccountGroupOverview } from '@/resources/services/accountsBalanceServices';

  import { Line } from 'vue-chartjs';
  import ChartJS from 'chart.js/auto';
  import { CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
  ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);
</script>

<template>
  <!--STATE  loaded-->
  <template v-if="state == 'loaded'">
    <div v-for="(group, index) in groups" :key="index">

      <template v-if="group.accounts.length">
        <h4>{{ group.name }} - {{ group.table?.actual?.toLocaleString('sk-SK') ?? '0' }} €</h4>
        <div class="mb-1">{{group.description}}</div>

        <b-row>
          <b-col cols="12" md="6">
            <BTable striped hover head-variant="dark" :items="group.table.rows" :fields="group.table.columns" responsive>
              <template #cell(period)="data">
                <strong>{{ data.value }}</strong>
              </template>
              <template #cell(sum)="data">
                <strong>{{ data.value }}</strong>
              </template>
            </BTable>
          </b-col>
          <b-col cols="12" md="6">
            <div class="ratio mb-5 mb-md-0 mt-2 mt-md-0 lineContainer">
              <Line :data="group.chartData"
                    :options="chartOptions" class="h-100" />
            </div>
          </b-col>
        </b-row>
      </template>

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
        groups: [],
        chartOptions: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top'
            }
          }
        },
      };
    },
    mounted() {
      this.loadData();
    },
    methods: {
      loadData() {
        listAccountGroupOverview()
          .then((groups) => {
            for (let group of groups) {
              if (group.accounts.length) {
                group.table = this.getTable(group.accounts);
                group.chartData = this.getChartData(group.accounts);
              }
            }

            this.groups = groups;
            this.state = "loaded";
          })
          .catch(() => {
            this.state = "error";
          });
      },
      getAccoundFields(accounts) {
        return accounts.map(account => {
          return { key: account.name, label: account.name }
        })
      },
      getUniquePeriods(accounts) {
        const periods = []

        accounts.forEach(account => {
          account.balances.forEach(balance => {
            const key = `${balance.year}-${String(balance.month).padStart(2, "0")}`;
            if (!periods.includes(key)) {
              periods.push(key);
            }
          });
        });

        return Array.from(periods).sort();
      },
      getTable(accounts) {
        const periods = this.getUniquePeriods(accounts);

        const rows = periods.map(key => {
          const [year, month] = key.split("-").map(Number);
          const row = { period: `${month}/${year}` };

          let sum = 0;

          accounts.forEach(acc => {
            const b = acc.balances.find(bb => bb.year === year && bb.month === month);
            const value = b?.amount ?? 0;
            row[acc.id] = value;
            sum += value;
          });

          row.sum = sum;
          return row;
        })

        const columns = accounts.map(acc => ({
          key: acc.id,
          label: acc.name + (acc.description ? ` (${acc.description})` : ''),
          formatter: (value) => `${value.toLocaleString()} €`,
          class: 'text-center'
        }));

        columns.unshift({ key: 'period', label: '', class: 'text-center' });
        columns.push(
          {
            key: 'sum',
            label: 'Spolu',
            formatter: (value) => `${value.toLocaleString()} €`,
            class: 'text-center'
          }
        );

        const actual = rows[rows.length - 1].sum;

        return { rows, columns, actual };
      },
      getChartData(accounts) {
        const labels = this.getUniquePeriods(accounts);

        // Dataset pre každý účet
        const datasets = accounts.map((account, i) => {
          const data = labels.map(label => {
            const [year, month] = label.split("-");
            const balance = account.balances.find(
              b => b.year == year && b.month == Number(month)
            );
            return balance?.amount ?? 0;
          });

          return {
            label: account.name,
            data,
            borderColor: this.getColor(i),
            tension: 0.2,
          };
        });

        // Dataset pre súčet všetkých účtov
        const sumData = labels.map(label => {
          const [year, month] = label.split("-");
          return accounts.reduce((sum, account) => {
            const balance = account.balances.find(
              b => b.year == year && b.month == Number(month)
            );
            return sum + (balance?.amount ?? 0);
          }, 0);
        });

        datasets.push({
          label: 'Súčet',
          data: sumData,
          borderColor: 'black',
          backgroundColor: 'black',
          borderWidth: 3,
          tension: 0.2,
        });

        const formattedLabels = labels.map(p => {
          const [y, m] = p.split("-");
          return `${m}/${y}`;
        });

        return {
          labels: formattedLabels,
          datasets
        };
      },
      getColor(index) {
        const colors = [
          'rgb(75, 192, 192)',
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 206, 86)',
          'rgb(153, 102, 255)',
          'rgb(255, 159, 64)'
        ];
        return colors[index % colors.length];
      },
    },
  }
</script>
