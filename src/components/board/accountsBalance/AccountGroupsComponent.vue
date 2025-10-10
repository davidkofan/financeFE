<script setup>
  import { listAccountGroupOverview } from '@/resources/services/accountsBalanceServices';

  import { Line } from 'vue-chartjs';
  import ChartJS from 'chart.js/auto';
  import { CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
  ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);</script>

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
      <b-col cols="12" md="3" v-for="(group, index) in accountGroupsActuals" :key="index">
        <b-card :bg-variant="group.variant"
                text-variant="white"
                :header="group.name"
                class="text-center mb-2">
          <b-card-text>
            <h3>{{ financeFormatter(group.value) }}</h3>
          </b-card-text>
        </b-card>
      </b-col>
    </b-row>

    <template v-for="(group, index) in groups">

      <div class="border border-1 w-100 my-2"></div>

      <div v-if="group.accounts.length" :key="index">
        <h4>{{ group.name }}</h4>
        <div class="mb-1">{{group.description}}</div>


        <b-row>
          <b-col cols="12" md="6">
            <BTable striped hover head-variant="dark"
                    :items="group.table.rows"
                    :fields="group.table.columns"
                    :per-page="group.table.perPage"
                    :current-page="group.table.currentPage"
                    responsive>

              <!-- formátovanie obdobia -->
              <template #cell(period)="data">
                <strong>{{ data.value }}</strong>
              </template>

              <!-- formátovanie sumy -->
              <template #cell(sum)="data">
                <strong>{{ financeFormatter(data.value) }}</strong>
              </template>

              <!-- formátovanie sumy -->
              <template #cell()="data">
                {{ data.value ? financeFormatter(data.value) : "-" }}
              </template>

              <!-- formátovanie rozdielu -->
              <template #cell(diff)="data">
                <span class="text-primary" v-if="data.item.expectation">
                  {{ financeFormatter(data.value) }}
                </span>
                <span v-else :class="data.unformatted < 0 ? 'text-danger' : 'text-success'">
                  {{ financeFormatter(data.value) }}
                </span>
              </template>


            </BTable>


            <!-- Ovládanie stránkovania -->
            <div class="d-flex justify-content-between align-items-center mt-2">
              <span></span>

              <!-- Pagination -->
              <b-pagination v-model="group.table.currentPage"
                            :total-rows="group.table.rows.length"
                            :per-page="group.table.perPage"
                            align="right"
                            size="md"
                            class="my-0" />

              <!-- Výber počtu záznamov -->
              <b-form-group class="mb-0">
                <b-form-select id="perPageSelect"
                               v-model="group.table.perPage"
                               :options="group.table.perPageOptions"
                               size="md" />
              </b-form-group>
            </div>

          </b-col>
          <b-col cols="12" md="6">
            <div class="ratio mb-5 mb-md-2 mt-2 mt-md-0 lineContainer">
              <Line :data="group.chartData"
                    :options="chartOptions" class="h-100" />
            </div>
          </b-col>
        </b-row>

      </div>

    </template>
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
        accountGroupsActuals: [],
        lastUpdated: null,
        chartOptions: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top'
            }
          }
        },
        variants: ['success', 'info', 'danger', 'warning', 'dark', 'primary', 'info', 'warning']
      };
    },
    mounted() {
      this.loadFromCacheOrFetch();
    },
    methods: {
      // 🔹 Najprv skúsi načítať z localStorage, inak fetchne
      loadFromCacheOrFetch() {
        const cachedData = localStorage.getItem('accountGroupOverview');
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          this.groups = parsed.groups;
          this.accountGroupsActuals = parsed.accountGroupsActuals;
          this.lastUpdated = parsed.lastUpdated;
          this.state = 'loaded';
        } else {
          this.fetchFreshData();
        }
      },

      // 🔹 Fetch čerstvých dát zo služby a uloženie do cache
      fetchFreshData() {
        this.state = 'unloaded';
        listAccountGroupOverview()
          .then((groups) => {
            for (let group of groups) {
              if (group.accounts.length) {
                group.table = this.getTable(group.accounts, group.expectedIncreases);
                group.chartData = this.getChartData(group.accounts, group.expectedIncreases);
              }
            }

            this.accountGroupsActuals = groups.map((g, index) => ({
              name: g.name,
              value: g.accounts.length ? g.table.actual : 0,
              variant: this.variants[index % this.variants.length]
            }));

            this.groups = groups;
            this.lastUpdated = new Date().toLocaleString('sk-SK');
            this.state = 'loaded';

            // 🔸 uloženie do localStorage
            localStorage.setItem(
              'accountGroupOverview',
              JSON.stringify({
                groups: this.groups,
                accountGroupsActuals: this.accountGroupsActuals,
                lastUpdated: this.lastUpdated
              })
            );
          })
          .catch(() => {
            this.state = 'error';
          });
      },

      // 🔹 Vymaže cache a načíta nové dáta
      refreshData() {
        localStorage.removeItem('accountGroupOverview');
        this.fetchFreshData();
      },

      // --- ostatné metódy ostávajú rovnaké ---
      getAccoundFields(accounts) {
        return accounts.map(account => ({ key: account.name, label: account.name }));
      },
      getUniquePeriods(accounts) {
        const periods = [];
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
      getTable(accounts, expectedIncreases) {
        const periods = this.getUniquePeriods([...accounts, { balances: expectedIncreases }]);
        let prevSum = null;

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

          if (sum) {
            row.diff = prevSum !== null ? sum - prevSum : null;
            row.sum = sum;
          } else {
            const expectedIncrease = expectedIncreases.find(inc => inc.year === year && inc.month === month);
            if (expectedIncrease) {
              row.diff = expectedIncrease.amount;
              row.sum = expectedIncrease.amount + prevSum;
              row.expectation = true;
              sum = expectedIncrease.amount + prevSum;
            }
          }

          prevSum = sum;
          return row;
        });

        const columns = accounts.map(acc => ({
          key: acc.id,
          label: acc.name + (acc.description ? ` (${acc.description})` : ''),
          class: 'text-center'
        }));

        columns.unshift({ key: 'period', label: '', class: 'text-center' });
        columns.push(
          {
            key: 'sum',
            label: 'Spolu',
            class: 'text-center'
          },
          {
            key: 'diff',
            label: 'Prírastok',
            formatter: (value) =>
              value === null ? '-' : `${value >= 0 ? '+' : ''}${value}`,
            class: 'text-center'
          }
        );

        const actualRow = [...rows].reverse().find(r => !r.expectation);
        const actual = actualRow ? actualRow.sum : 0;

        const perPage = 10;
        const totalPages = Math.ceil(rows.length / perPage);

        return {
          rows,
          columns,
          actual,
          perPage,
          currentPage: totalPages || 1,
          perPageOptions: [5, 10, 20, 50]
        };
      },

      getChartData(accounts, expectedIncreases = []) {
        const labels = this.getUniquePeriods([...accounts, { balances: expectedIncreases }]);
        const datasets = accounts.map((account, i) => {
          const data = labels.map(label => {
            const [year, month] = label.split("-");
            const balance = account.balances.find(b => b.year == year && b.month == Number(month));
            return balance?.amount ?? null;
          });
          return {
            label: account.name,
            data,
            borderColor: this.getColor(i),
            tension: 0.2,
          };
        });

        let prevSum = null;
        const sumReal = [];
        const sumPred = [];

        labels.forEach(label => {
          const [year, month] = label.split("-").map(Number);
          let sum = accounts.reduce((s, acc) => {
            const balance = acc.balances.find(b => b.year === year && b.month === month);
            return s + (balance?.amount ?? 0);
          }, 0);

          if (sum > 0) {
            sumReal.push(sum);
            sumPred.push(null);
            prevSum = sum;
          } else {
            const exp = expectedIncreases.find(e => e.year === year && e.month === month);
            if (exp && prevSum !== null) {
              const predicted = prevSum + exp.amount;
              sumReal.push(null);
              sumPred.push(predicted);
              prevSum = predicted;
            } else {
              sumReal.push(null);
              sumPred.push(null);
            }
          }
        });

        datasets.push(
          {
            label: 'Súčet (reálne)',
            data: sumReal,
            borderColor: 'black',
            borderWidth: 3,
            tension: 0.2,
          },
          {
            label: 'Súčet (predpoklad)',
            data: sumPred,
            borderColor: 'black',
            borderWidth: 3,
            borderDash: [5, 5],
            tension: 0.2,
          }
        );

        const formattedLabels = labels.map(p => {
          const [y, m] = p.split("-");
          return `${m}/${y}`;
        });

        return { labels: formattedLabels, datasets };
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

      financeFormatter(val) {
        if (val == null || isNaN(val)) return '-';
        return `${Number(val).toLocaleString('sk-SK', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })} €`;
      },
    }
  }
</script>
