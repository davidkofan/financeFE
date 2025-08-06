<script setup>
  import { listAccountGroupOverview } from '@/resources/services/adminServices';

  import { Line } from 'vue-chartjs';
  import ChartJS from 'chart.js/auto';
  import { CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
  ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);
</script>

<template>
  <div v-for="(group, index) in groups" :key="index">

    <h3>{{group.name}}</h3>
    <div class="mb-1">{{group.description}}</div>

    <b-row>
      <b-col cols="6">
        <b-table striped hover head-variant="dark" :items="group.table.rows" :fields="group.table.columns"></b-table>
      </b-col>
      <b-col cols="6">
        <Line :data="group.chartData" class="mt-3 h-auto" :options="chartOptions" />
      </b-col>
    </b-row>

  </div>

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
              group.table = this.getTable(group.accounts);
              group.chartData = this.getChartData(group.accounts);
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
          accounts.forEach(acc => {
            const b = acc.balances.find(bb => bb.year === year && bb.month === month);
            row[acc.id] = b?.amount ?? 0;
          });
          return row;
        });

        const columns = accounts.map(acc => ({
          key: acc.id,
          label: acc.name + (acc.description ? ` (${acc.description})` : '')
        }));

        columns.unshift({ key: 'period', label: '' })

        return { rows, columns };
      },
      getChartData(accounts) {
        const labels = this.getUniquePeriods(accounts);

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
