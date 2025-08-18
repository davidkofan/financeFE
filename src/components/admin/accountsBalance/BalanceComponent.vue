<script setup>
  import { listBalance, createBalance, updateBalance, deleteBalance } from '@/resources/services/accountsBalanceServices';
  import CustomModal from '@/components/common/CustomModal.vue';

  defineProps({
    accountId: {
      type: String,
      required: true,
    },
  })
</script>

<template>
  <!-- STATE  loaded-->
  <template v-if="state == 'loaded'">
    <BTable striped hover head-variant="dark" :items="balances" :fields="fields" responsive>
      <template #cell(buttons)="data">
        <BButtonGroup>
          <BButton variant="dark" @click="openMainFormModal(data.item, 'edit')">Úprava</BButton>
          <BButton variant="danger" @click="openDeleteModal(data.item)">Odstránenie</BButton>
        </BButtonGroup>
      </template>
      <template #cell(period)="data">
        <strong>{{ data.value }}</strong>
      </template>
    </BTable>

    <BButton variant="dark" @click="openMainFormModal({}, 'create')">Pridať stav účtu</BButton>

    <BModal :title="mainFormModalConfig.mode === 'create' ? 'Pridať stav účtu' : 'Upraviť stav účtu'" v-model="mainFormModalConfig.show" noFooter @hidden="closeMainFormModal()" teleport-to="body">
      <BForm @submit.prevent="submitForm">
        <div class="row">
          <BForm-group label="Rok" label-for="year" class="col-12 col-md-4">
            <BForm-select id="year" v-model="mainFormModalConfig.formData.year" :options="yearOptions" required />
          </BForm-group>

          <BForm-group label="Mesiac" label-for="month" class="col-12 col-md-4">
            <BForm-select id="month" v-model="mainFormModalConfig.formData.month" :options="monthOptions" required />
          </BForm-group>

          <BForm-group label="Hodnota" label-for="amount" class="col-12 col-md-4">
            <BForm-input id="amount" v-model="mainFormModalConfig.formData.amount" type="number" required></BForm-input>
          </BForm-group>
        </div>

        <BButtonGroup class="mt-3">
          <BButton variant="success" type="submit">Uložiť</BButton>
          <BButton variant="danger" @click="closeMainFormModal()">Zrušiť</BButton>
        </BButtonGroup>
      </BForm>
    </BModal>
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

  <!--custom modal-->
  <CustomModal v-if="customModalConfig" :modalConfig="customModalConfig"></CustomModal>
</template>

<script>
  export default {
    data() {
      return {
        state: 'unloaded',
        mainFormModalConfig: { show: false, formData: {} },
        customModalConfig: null,
        balances: [],
        fields: [
          {
            key: 'period',
            label: '',
            class: 'text-center'
          },
          {
            key: 'amount',
            label: 'Hodnota',
            formatter: (value) => `${value.toLocaleString()} €`,
            class: 'text-center'
          },
          {
            key: 'buttons',
            label: '',
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
        yearOptions: []
      };
    },
    mounted() {
      const currentYear = new Date().getFullYear();
      for (let i = currentYear - 1; i <= currentYear + 1; i++) {
        this.yearOptions.push({ value: String(i), text: String(i) });
      }
    },
    watch: {
      accountId: {
        immediate: true,
        handler(value) {
          this.loadData();
        }
      }
    },
    methods: {
      loadData() {
        listBalance(this.accountId)
          .then((response) => {
            response.forEach(balance => {
              balance.period = balance.year + '/' + balance.month;
            });
            this.balances = response;

            this.state = "loaded";
          })
          .catch(() => {
            this.state = "error";
          });

      },
      submitForm() {
        if (this.mainFormModalConfig.mode === 'edit') {
          this.updateBalance();
        } else {
          this.createBalance();
        }
      },
      createBalance() {
        const payload = {
          ...this.mainFormModalConfig.formData,
          accountId: this.accountId,
          id: this.generate24CharGUID()
        }
        createBalance(payload)
          .then(() => {
            this.loadData();
            this.closeMainFormModal();
          })
      },
      updateBalance() {
        updateBalance(this.mainFormModalConfig.formData.id, this.mainFormModalConfig.formData)
          .then(() => {
            this.loadData();
            this.closeMainFormModal();
          })
      },
      openDeleteModal(data) {
        this.customModalConfig = {
          title: 'Odstránenie stavu účtu',
          text: `Naozaj chceš odstrániť stav účtu?`,
          closeCallback: () => { this.customModalConfig = null; },
          buttons: [
            {
              text: 'Odstrániť',
              variant: 'btn-danger',
              callback: () => {
                deleteBalance(data.id)
                  .then(() => {
                    this.loadData();
                    this.customModalConfig = null;
                  })
              }
            },
            {
              text: 'Zrušiť',
              variant: 'btn-secondary',
              callback: () => { this.customModalConfig = null; }
            }
          ]
        };
      },
      openMainFormModal(formData, mode) {
        Object.assign(this.mainFormModalConfig, {
          show: true,
          formData: { ...formData },
          mode
        });
      },
      closeMainFormModal() {
        Object.assign(this.mainFormModalConfig, {
          show: false,
          formData: {}
        });
      },
      generate24CharGUID() {
        const chars = 'abcdef0123456789';
        let guid = '';
        for (let i = 0; i < 24; i++) {
          guid += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return guid;
      },
    },
  }
</script>
