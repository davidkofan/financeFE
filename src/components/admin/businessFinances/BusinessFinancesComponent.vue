<script setup>
  //import { listAccountGroup, createAccountGroup, updateAccountGroup } from '@/resources/services/accountsBalanceServices';
  import CustomModal from '@/components/common/CustomModal.vue';
</script>

<template>
  <!-- STATE  loaded-->
  <template v-if="state == 'loaded'">
    <BButtonGroup class="mb-2">
      <BButton variant="dark" @click="openMainFormModal({}, 'create')">Pridať fiškálny rok</BButton>
    </BButtonGroup>

    <b-row>
      <b-col cols="12" xl="4" v-for="(data, index) in fiscalYears" :key="index" class="mb-4">
        <BCard :header="'Fiškálny rok č.' + (index + 1)"
               header-tag="header"
               :title="data.name">
          <BCard-text>{{data.description}}</BCard-text>
          <BButtonGroup>
            <BButton variant="warning" @click="">Správa doplatkov</BButton>
          </BButtonGroup>

          <template #footer>
            <BButtonGroup>
              <BButton variant="primary" @click="openMainFormModal(data,'edit')">Konfigurácia</BButton>
              <BButton variant="danger">Odstránenie</BButton>
            </BButtonGroup>
          </template>
        </BCard>
      </b-col>
    </b-row>

    <BModal :title="mainFormModalConfig.mode === 'create' ? 'Pridať fiškálny rok' : 'Upraviť fiškálny rok'" v-model="mainFormModalConfig.show" noFooter @hidden="closeMainFormModal()">
      <BForm @submit.prevent="submitForm">
        <div class="row">
          <BForm-group label="Názov" label-for="name">
            <BForm-input id="name" v-model="mainFormModalConfig.formData.name" required></BForm-input>
          </BForm-group>

          <BForm-group label="Popis" label-for="description">
            <BForm-input id="description" v-model="mainFormModalConfig.formData.description"></BForm-input>
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

  <!--STATE  error-->
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
        mainFormModalConfig: { show: false },
        customModalConfig: null,
        fiscalYears: [],
      };
    },
    mounted() {
      this.loadData();
    },
    methods: {
      loadData() {
        //mock data
        this.fiscalYears = [
          { id: '1', name: '2023' },
          { id: '2', name: '2024' },
          { id: '3', name: '2025' },
          { id: '4', name: '2026' }
        ];

        this.state = "loaded";


        //listAccountGroup()
        //  .then((response) => {
        //    this.accountGroups = response;
        //    this.state = "loaded";
        //  })
        //  .catch(() => {
        //    this.state = "error";
        //  });

      },
      submitForm() {
        //if (this.mainFormModalConfig.mode === 'edit') {
        //  this.updateAccountGroup();
        //} else {
        //  this.createAccountGroup();
        //}
      },
      //createAccountGroup() {
      //  const payload = {
      //    ...this.mainFormModalConfig.formData,
      //    id: this.generate24CharGUID()
      //  };
      //  createAccountGroup(payload)
      //    .then(() => {
      //      this.loadData();
      //      this.closeModal();
      //    })
      //},
      //updateAccountGroup() {
      //  updateAccountGroup(this.mainFormModalConfig.formData.id, this.mainFormModalConfig.formData)
      //    .then(() => {
      //      this.loadData();
      //      this.closeModal();
      //    })
      //},
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
      //generate24CharGUID() {
      //  const chars = 'abcdef0123456789';
      //  let guid = '';
      //  for (let i = 0; i < 24; i++) {
      //    guid += chars.charAt(Math.floor(Math.random() * chars.length));
      //  }
      //  return guid;
      //},
    },
  }
</script>
