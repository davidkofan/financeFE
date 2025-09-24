<script setup>
  import { listIncome, createIncome, updateIncome, deleteIncome } from '@/resources/services/expensesAndIncomeServices';
  import { generate24CharGUID } from '@/resources/globalFunctions';
  import CustomModal from '@/components/common/CustomModal.vue';
  import { useRouter, useRoute } from 'vue-router';
</script>

<template>
  <!-- STATE loaded -->
  <template v-if="state == 'loaded'">
    <BButtonGroup class="mb-2">
      <BButton variant="outline-secondary" @click="goBack()">Späť</BButton>
      <BButton variant="dark" @click="openModal({}, 'mainForm', 'create')">Pridať príjem</BButton>
    </BButtonGroup>

    <b-row>
      <b-col cols="12" xl="4" v-for="(data, index) in incomes" :key="index" class="mb-4">
        <BCard :header="'Príjem č.' + (index + 1)"
               header-tag="header"
               :title="data.name">

          <BCard-text>{{data.description}}</BCard-text>
          <BCard-text>
            <h4><BBadge variant="dark">{{data.amount}} €</BBadge></h4>
          </BCard-text>

          <template #footer>
            <BButtonGroup>
              <BButton variant="primary" @click="openModal(data,'mainForm', 'edit')">Konfigurácia</BButton>
              <BButton variant="danger" @click="openDeleteModal(data)">Odstránenie</BButton>
            </BButtonGroup>
          </template>
        </BCard>
      </b-col>
    </b-row>

    <BModal :title="modalConfig.mode === 'create' ? 'Pridať príjem' : 'Upraviť príjem'"
            v-model="modalConfig.show" noFooter @hidden="closeModal()">

      <BForm @submit.prevent="submitForm">
        <BFormGroup label="Názov">
          <BForm-input v-model="modalConfig.formData.name" required />
        </BFormGroup>

        <BFormGroup label="Hodnota">
          <BForm-input v-model="modalConfig.formData.amount" type="number" required />
        </BFormGroup>

        <BFormGroup label="Popis">
          <BForm-input v-model="modalConfig.formData.description" />
        </BFormGroup>

        <BButtonGroup class="mt-3">
          <BButton variant="success" type="submit">Uložiť</BButton>
          <BButton variant="danger" @click="closeModal()">Zrušiť</BButton>
        </BButtonGroup>
      </BForm>
    </BModal>
  </template>

  <!-- STATE unloaded -->
  <template v-else-if="state == 'unloaded'">
    <div class="d-grid justify-content-center my-5">
      <BSpinner label="Načítavanie..." />
    </div>
  </template>

  <!-- STATE error -->
  <template v-else-if="state == 'error'">
    <h2 class="mt-4">
      <b-badge variant="danger">Nastala neočakávaná chyba systému</b-badge>
    </h2>
  </template>

  <!-- custom modal -->
  <CustomModal v-if="customModalConfig" :modalConfig="customModalConfig" />
</template>

<script>
  export default {
    data() {
      return {
        state: 'unloaded',
        modalConfig: { show: false, formData: {} },
        customModalConfig: null,
        incomes: [],
        router: useRouter(),
        route: useRoute(),
      };
    },
    computed: {
      incomesGroupId() {
        return this.$route.params.id;
      }
    },
    created() {
      this.loadData();
    },
    methods: {
      loadData() {
        listIncome({ groupId: this.incomesGroupId })
          .then((response) => {
            this.incomes = response;
            this.state = "loaded";
          })
          .catch(() => {
            this.state = "error";
          });
      },

      submitForm() {
        if (this.modalConfig.mode === 'edit') {
          this.updateIncome();
        } else {
          this.createIncome();
        }
      },

      createIncome() {
        const payload = {
          ...this.modalConfig.formData,
          groupId: this.incomesGroupId,
          id: generate24CharGUID()
        };
        createIncome(payload)
          .then(() => {
            this.loadData();
            this.closeModal();
          });
      },

      updateIncome() {
        const payload = {
          ...this.modalConfig.formData,
          groupId: this.incomesGroupId,
        };
        updateIncome(this.modalConfig.formData.id, payload)
          .then(() => {
            this.loadData();
            this.closeModal();
          });
      },

      openDeleteModal(data) {
        this.customModalConfig = {
          title: 'Odstránenie príjmu',
          text: `Naozaj chceš odstrániť príjem?`,
          closeCallback: () => { this.customModalConfig = null; },
          buttons: [
            {
              text: 'Odstrániť',
              variant: 'btn-danger',
              callback: () => {
                deleteIncome(data.id)
                  .then(() => {
                    this.loadData();
                    this.customModalConfig = null;
                  });
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

      openModal(formData, modalType, mode) {
        Object.assign(this.modalConfig, {
          show: true,
          formData: { ...formData },
          modalType,
          mode
        });
      },
      closeModal() {
        Object.assign(this.modalConfig, {
          show: false,
          formData: {}
        });
      },
      goBack() {
        this.router.back();
      }
    }
  }
</script>
