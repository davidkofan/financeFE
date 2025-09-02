<script setup>
  import { listFinancialYear, createFinancialYear, updateFinancialYear, deleteFinancialYear } from '@/resources/services/businessFinancesServices';
  import { generate24CharGUID } from '@/resources/globalFunctions';
  import CustomModal from '@/components/common/CustomModal.vue';
  import { useRouter, useRoute } from 'vue-router';
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
            <BButton variant="success" @click="openFiscalYearDetail(data)">Správa fakturácií</BButton>
          </BButtonGroup>

          <template #footer>
            <BButtonGroup>
              <BButton variant="primary" @click="openMainFormModal(data,'edit')">Konfigurácia</BButton>
              <BButton variant="danger" @click="openDeleteModal(data)">Odstránenie</BButton>
            </BButtonGroup>
          </template>
        </BCard>
      </b-col>
    </b-row>

    <BModal :title="mainFormModalConfig.mode === 'create' ? 'Pridať fiškálny rok' : 'Upraviť fiškálny rok'" v-model="mainFormModalConfig.show" noFooter @hidden="closeMainFormModal()">
      <BForm @submit.prevent="submitForm">
        <div class="row">
          <BFormGroup label="Názov" label-for="name">
            <BForm-input id="name" v-model="mainFormModalConfig.formData.name" required></BForm-input>
          </BFormGroup>

          <BFormGroup label="Popis" label-for="description">
            <BForm-input id="description" v-model="mainFormModalConfig.formData.description"></BForm-input>
          </BFormGroup>
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
        mainFormModalConfig: { show: false, formData: {} },
        customModalConfig: null,
        fiscalYears: [],
        router: useRouter(),
        route: useRoute(),
      };
    },
    mounted() {
      this.loadData();
    },
    methods: {
      loadData() {
        listFinancialYear()
          .then((response) => {
            this.fiscalYears = response;
            this.state = "loaded";
          })
          .catch(() => {
            this.state = "error";
          });

      },
      submitForm() {
        if (this.mainFormModalConfig.mode === 'edit') {
          this.updateFinancialYear();
        } else {
          this.createFinancialYear();
        }
      },
      createFinancialYear() {
        const payload = {
          ...this.mainFormModalConfig.formData,
          id: generate24CharGUID()
        };
        createFinancialYear(payload)
          .then(() => {
            this.loadData();
            this.closeMainFormModal();
          })
      },
      updateFinancialYear() {
        updateFinancialYear(this.mainFormModalConfig.formData.id, this.mainFormModalConfig.formData)
          .then(() => {
            this.loadData();
            this.closeMainFormModal();
          })
      },
      openDeleteModal(data) {
        this.customModalConfig = {
          title: 'Odstránenie fiškálneho roku',
          text: `Naozaj chceš odstrániť fiškálny rok ${data.name}?`,
          closeCallback: () => { this.customModalConfig = null; },
          buttons: [
            {
              text: 'Odstrániť',
              variant: 'btn-danger',
              callback: () => {
                deleteFinancialYear(data.id)
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
      openFiscalYearDetail(data) {
        this.router.push({ name: 'fiscalYearDetail', params: { id: data.id } });
      },
    },
  }
</script>
