<script setup>
  import { listBalance, createBalance, updateBalance } from '@/resources/services/adminServices';

  defineProps({
    accountId: {
      type: String,
      required: true,
    },
  })
</script>

<template>
  <b-table striped hover head-variant="dark" :items="balances" :fields="fields">
    <template #cell(buttons)="data">
      <b-button-group>
        <b-button variant="dark" @click="openModal(data.item,'mainForm', 'edit')">Úprava</b-button>
        <b-button variant="danger">Odstránenie</b-button>
      </b-button-group>
    </template>
  </b-table>

  <b-button variant="dark" @click="openModal({}, 'mainForm', 'create')">Pridať stav účtu</b-button>

  <template v-if="modalConfig.modalType === 'mainForm'">
    <b-modal :title="modalConfig.mode === 'create' ? 'Pridať stav účtu' : 'Upraviť stav účtu'" v-model="modalConfig.show" noFooter>
      <b-form @submit.prevent="submitForm">
        <div class="row">
          <b-form-group label="Rok" label-for="year" class="col-12 col-md-4">
            <b-form-select id="year" v-model="modalConfig.formData.year" :options="yearOptions" required />
          </b-form-group>

          <b-form-group label="Mesiac" label-for="month" class="col-12 col-md-4">
            <b-form-select id="month" v-model="modalConfig.formData.month" :options="monthOptions" required />
          </b-form-group>

          <b-form-group label="Hodnota" label-for="amount" class="col-12 col-md-4">
            <b-form-input id="amount" v-model="modalConfig.formData.amount" required></b-form-input>
          </b-form-group>
        </div>

        <b-button-group class="mt-3">
          <b-button variant="success" type="submit">Uložiť</b-button>
          <b-button variant="danger" @click="closeModal()">Zrušiť</b-button>
        </b-button-group>
      </b-form>
    </b-modal>
  </template>

</template>

<script>
  export default {
    data() {
      return {
        state: 'unloaded',
        modalConfig: { show: false },
        balances: [],
        fields: [
          { key: 'year', label: 'Rok' },
          { key: 'month', label: 'Mesiac' },
          { key: 'amount', label: 'Hodnota' },
          { key: 'buttons', label: '' },
        ],
        monthOptions: [
          { value: '1', text: 'Január' },
          { value: '2', text: 'Február' },
          { value: '3', text: 'Marec' },
          { value: '4', text: 'Apríl' },
          { value: '5', text: 'Máj' },
          { value: '6', text: 'Jún' },
          { value: '7', text: 'Júl' },
          { value: '8', text: 'August' },
          { value: '9', text: 'September' },
          { value: '10', text: 'Október' },
          { value: '11', text: 'November' },
          { value: '12', text: 'December' }
        ],
        yearOptions: []
      };
    },
    mounted() {
      const currentYear = new Date().getFullYear();
      for (let i = currentYear - 2; i <= currentYear + 1; i++) {
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
            this.balances = response;
            this.state = "loaded";
          })
          .catch(() => {
            this.state = "error";
          });

      },
      submitForm() {
        if (this.modalConfig.mode === 'edit') {
          this.updateBalance();
        } else {
          this.createBalance();
        }
      },
      createBalance() {
        const payload = {
          ...this.modalConfig.formData,
          accountId: this.accountId,
          id: this.generate24CharGUID()
        }
        createBalance(payload)
          .then(() => {
            this.loadData();
            this.closeModal();
          })
          .catch(() => {
            alert('Error creating account group');
          });
      },
      updateBalance() {
        updateBalance(this.modalConfig.formData.id, this.modalConfig.formData)
          .then(() => {
            this.loadData();
            this.closeModal();
          })
          .catch(() => {
            alert('Error updating account group');
          });
      },
      openModal(formData, modalType, mode) {
        Object.assign(this.modalConfig, {
          show: true,
          formData: { ...formData },
          modalType,
          mode
        });
      },
      closeModal() {
        Object.assign(this.modalConfig, { show: false });
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
