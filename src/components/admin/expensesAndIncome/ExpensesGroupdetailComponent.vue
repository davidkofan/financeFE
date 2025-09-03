<script setup>
  import { listExpense, createExpense, updateExpense, deleteExpense } from '@/resources/services/expensesAndIncomeServices';
  import { generate24CharGUID } from '@/resources/globalFunctions';
  import CustomModal from '@/components/common/CustomModal.vue';
  import { useRouter, useRoute } from 'vue-router';
</script>

<template>
  <!-- STATE  loaded-->
  <template v-if="state == 'loaded'">
    <BButtonGroup class="mb-2">
      <BButton variant="outline-secondary" @click="goBack()">Späť</BButton>
      <BButton variant="dark" @click="openModal({}, 'mainForm', 'create')">Pridať výdavok</BButton>
    </BButtonGroup>

    <b-row>
      <b-col cols="12" xl="4" v-for="(data, index) in expenses" :key="index" class="mb-4">
        <BCard :header="'Výdavok č.' + (index + 1)"
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

    <BModal :title="modalConfig.mode === 'create' ? 'Pridať výdavok' : 'Upraviť výdavok'" v-model="modalConfig.show" noFooter @hidden="closeModal()">
      <BForm @submit.prevent="submitForm">
        <BFormGroup label="Názov" label-for="tax">
          <BForm-input id="name" v-model="modalConfig.formData.name" required></BForm-input>
        </BFormGroup>

        <BFormGroup label="Hodnota" label-for="amount">
          <BForm-input id="amount" v-model="modalConfig.formData.amount" type="number" required></BForm-input>
        </BFormGroup>

        <BFormGroup label="Popis" label-for="description">
          <BForm-input id="description" v-model="modalConfig.formData.description"></BForm-input>
        </BFormGroup>

        <BButtonGroup class="mt-3">
          <BButton variant="success" type="submit">Uložiť</BButton>
          <BButton variant="danger" @click="closeModal()">Zrušiť</BButton>
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
        modalConfig: { show: false, formData: {} },
        customModalConfig: null,
        expenses: [],
        router: useRouter(),
        route: useRoute(),
      };
    },
    computed: {
      expensesGroupId() {
        return this.$route.params.id
      }
    },
    created() {
      this.loadData();
    },
    methods: {
      loadData() {
        listExpense({ groupId: this.expensesGroupId })
          .then((response) => {
            this.expenses = response;
            this.state = "loaded";
          })
          .catch(() => {
            this.state = "error";
          });

      },
      submitForm() {
        if (this.modalConfig.mode === 'edit') {
          this.updateExpense();
        } else {
          this.createExpense();
        }
      },
      createExpense() {
        const payload = {
          ...this.modalConfig.formData,
          groupId: this.expensesGroupId,
          id: generate24CharGUID()
        };
        createExpense(payload)
          .then(() => {
            this.loadData();
            this.closeModal();
          })
      },
      updateExpense() {
        const payload = {
          ...this.modalConfig.formData,
          groupId: this.expensesGroupId,
        };
        updateExpense(this.modalConfig.formData.id, payload)
          .then(() => {
            this.loadData();
            this.closeModal();
          })
      },
      openDeleteModal(data) {
        this.customModalConfig = {
          title: 'Odstránenie výdavku',
          text: `Naozaj chceš odstrániť výdavok?`,
          closeCallback: () => { this.customModalConfig = null; },
          buttons: [
            {
              text: 'Odstrániť',
              variant: 'btn-danger',
              callback: () => {
                deleteExpense(data.id)
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
    },
  }
</script>
