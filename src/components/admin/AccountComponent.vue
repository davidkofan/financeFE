<script setup>
  import { listAccount, createAccount, updateAccount } from '@/resources/services/adminServices';
  import Balance from '@/components/admin/BalanceComponent.vue';

  defineProps({
    accountGroupId: {
      type: String,
      required: true,
    },
  })
</script>

<template>
  <b-row>
    <b-col cols="12" v-for="(data, index) in accounts" :key="index" class="mb-4">
      <b-card :header="'Účet č.' + (index + 1)"
              header-tag="header"
              :title="data.name">
        <b-card-text>{{data.description}}</b-card-text>
        <b-button-group>
          <b-button variant="success" @click="openModal(data,'balances', 'edit')">Správa stavu účtu</b-button>
          <b-button variant="primary" @click="openModal(data,'mainForm', 'edit')">Konfigurácia</b-button>
          <b-button variant="danger">Odstránenie</b-button>
        </b-button-group>
      </b-card>
    </b-col>
  </b-row>

  <b-button variant="dark" @click="openModal({}, 'mainForm', 'create')">Pridať účet</b-button>

  <template v-if="modalConfig.modalType === 'mainForm'">
    <b-modal :title="modalConfig.mode === 'create' ? 'Pridať účet' : 'Upraviť účet'" v-model="modalConfig.show" noFooter>
      <b-form @submit.prevent="submitForm">
        <div class="row">
          <b-form-group label="Názov" label-for="name">
            <b-form-input id="name" v-model="modalConfig.formData.name" required></b-form-input>
          </b-form-group>

          <b-form-group label="Popis" label-for="description">
            <b-form-input id="description" v-model="modalConfig.formData.description"></b-form-input>
          </b-form-group>
        </div>

        <b-button-group class="mt-3">
          <b-button variant="success" type="submit">Uložiť</b-button>
          <b-button variant="danger" @click="closeModal()">Zrušiť</b-button>
        </b-button-group>
      </b-form>
    </b-modal>
  </template>

  <template v-if="modalConfig.modalType === 'balances'">
    <b-modal title="Správa stavu účtu" v-model="modalConfig.show" noFooter size="lg">
      <Balance :accountId="modalConfig.formData.id"></Balance>
    </b-modal>
  </template>
</template>

<script>
  export default {
    data() {
      return {
        state: 'unloaded',
        modalConfig: { show: false },
        accounts: [],
      };
    },
    watch: {
      accountGroupId: {
        immediate: true,
        handler(value) {
          this.loadData();
        }
      }
    },
    methods: {
      loadData() {
        listAccount({ groupId: this.accountGroupId })
          .then((response) => {
            this.accounts = response;
            this.state = "loaded";
          })
          .catch(() => {
            this.state = "error";
          });

      },
      submitForm() {
        if (this.modalConfig.mode === 'edit') {
          this.updateAccount();
        } else {
          this.createAccount();
        }
      },
      createAccount() {
        const payload = {
          ...this.modalConfig.formData,
          groupId: this.accountGroupId,
          id: this.generate24CharGUID()
        };
        createAccount(payload)
          .then(() => {
            this.loadData();
            this.closeModal();
          })
          .catch(() => {
            alert('Error creating account');
          });
      },
      updateAccount() {
        const payload = {
          ...this.modalConfig.formData,
          groupId: this.accountGroupId,
        };
        updateAccount(this.modalConfig.formData.id, payload)
          .then(() => {
            this.loadData();
            this.closeModal();
          })
          .catch(() => {
            alert('Error updating account');
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
