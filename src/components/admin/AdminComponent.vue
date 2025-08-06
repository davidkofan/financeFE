<script setup>
  import { listAccountGroup, createAccountGroup, updateAccountGroup } from '@/resources/services/adminServices';
  import Account from '@/components/admin/AccountComponent.vue';
</script>

<template>
  <b-row>
    <b-col cols="12" md="4" v-for="(data, index) in accountGroups" :key="index" class="mb-4">
      <b-card :header="'Skupina č.' + (index + 1)"
              header-tag="header"
              :title="data.name">
        <b-card-text>{{data.description}}</b-card-text>
        <b-button-group>
          <b-button variant="success" @click="openModal(data,'accounts', 'edit')">Správa účtov</b-button>
          <b-button variant="primary" @click="openModal(data,'mainForm', 'edit')">Konfigurácia</b-button>
          <b-button variant="danger">Odstránenie</b-button>
        </b-button-group>
      </b-card>
    </b-col>
  </b-row>

  <b-button variant="dark" @click="openModal({}, 'mainForm', 'create')">Pridať skupinu</b-button>

  <template v-if="modalConfig.modalType === 'mainForm'">
    <b-modal :title="modalConfig.mode === 'create' ? 'Pridať skupinu' : 'Upraviť skupinu'" v-model="modalConfig.show" noFooter>
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

  <template v-if="modalConfig.modalType === 'accounts'">
    <b-modal title="Správa účtov" v-model="modalConfig.show" noFooter size="lg">
      <Account :accountGroupId="modalConfig.formData.id"></Account>
    </b-modal>
  </template>

</template>

<script>
  export default {
    data() {
      return {
        state: 'unloaded',
        modalConfig: { show: false },
        accountGroups: [],
      };
    },
    mounted() {
      this.loadData();
    },
    methods: {
      loadData() {
        listAccountGroup()
          .then((response) => {
            this.accountGroups = response;
            this.state = "loaded";
          })
          .catch(() => {
            this.state = "error";
          });

      },
      submitForm() {
        if (this.modalConfig.mode === 'edit') {
          this.updateAccountGroup();
        } else {
          this.createAccountGroup();
        }
      },
      createAccountGroup() {
        const payload = {
          ...this.modalConfig.formData,
          id: this.generate24CharGUID()
        };
        createAccountGroup(payload)
          .then(() => {
            this.loadData();
            this.closeModal();
          })
          .catch(() => {
            alert('Error creating account group');
          });
      },
      updateAccountGroup() {
        updateAccountGroup(this.modalConfig.formData.id, this.modalConfig.formData)
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
