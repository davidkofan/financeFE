<script setup>
  import {
    listExpensesGroup, createExpensesGroup, updateExpensesGroup, deleteExpensesGroup,
    listIncomesGroup, createIncomesGroup, updateIncomesGroup, deleteIncomesGroup
  } from '@/resources/services/expensesAndIncomeServices';

  import { generate24CharGUID } from '@/resources/globalFunctions';
  import CustomModal from '@/components/common/CustomModal.vue';
  import { useRouter } from 'vue-router';
</script>

<template>
  <!-- STATE  loaded -->
  <template v-if="state == 'loaded'">
    <!-- Výdavky -->
    <h3 class="mb-3">Skupiny výdavkov</h3>
    <BButtonGroup class="mb-2">
      <BButton variant="dark" @click="openMainFormModal({}, 'create', 'expense')">Pridať skupinu výdavkov</BButton>
    </BButtonGroup>

    <b-row>
      <b-col cols="12" xl="4" v-for="(data, index) in expensesGroups" :key="index" class="mb-4">
        <BCard :header="'Skupina výdavkov č.' + (index + 1)"
               header-tag="header"
               :title="data.name">
          <BCard-text>{{data.description}}</BCard-text>
          <BButtonGroup>
            <BButton variant="success" @click="openGroupDetail(data, 'expense')">Správa výdavkov</BButton>
          </BButtonGroup>
          <template #footer>
            <BButtonGroup>
              <BButton variant="primary" @click="openMainFormModal(data,'edit','expense')">Konfigurácia</BButton>
              <BButton variant="danger" @click="openDeleteModal(data,'expense')">Odstránenie</BButton>
            </BButtonGroup>
          </template>
        </BCard>
      </b-col>
    </b-row>

    <hr class="my-5" />

    <!-- Príjmy -->
    <h3 class="mb-3">Skupiny príjmov</h3>
    <BButtonGroup class="mb-2">
      <BButton variant="dark" @click="openMainFormModal({}, 'create', 'income')">Pridať skupinu príjmov</BButton>
    </BButtonGroup>

    <b-row>
      <b-col cols="12" xl="4" v-for="(data, index) in incomesGroups" :key="index" class="mb-4">
        <BCard :header="'Skupina príjmov č.' + (index + 1)"
               header-tag="header"
               :title="data.name">
          <BCard-text>{{data.description}}</BCard-text>
          <BButtonGroup>
            <BButton variant="success" @click="openGroupDetail(data, 'income')">Správa príjmov</BButton>
          </BButtonGroup>
          <template #footer>
            <BButtonGroup>
              <BButton variant="primary" @click="openMainFormModal(data,'edit','income')">Konfigurácia</BButton>
              <BButton variant="danger" @click="openDeleteModal(data,'income')">Odstránenie</BButton>
            </BButtonGroup>
          </template>
        </BCard>
      </b-col>
    </b-row>

    <!-- Modal pre expenses aj incomes -->
    <BModal :title="mainFormModalConfig.mode === 'create'
                ? (mainFormModalConfig.type === 'expense' ? 'Pridať skupinu výdavkov' : 'Pridať skupinu príjmov')
                : (mainFormModalConfig.type === 'expense' ? 'Upraviť skupinu výdavkov' : 'Upraviť skupinu príjmov')"
            v-model="mainFormModalConfig.show" noFooter
            @hidden="closeMainFormModal()">

      <BForm @submit.prevent="submitForm">
        <BFormGroup label="Názov">
          <BForm-input v-model="mainFormModalConfig.formData.name" required />
        </BFormGroup>

        <BFormGroup label="Popis">
          <BForm-input v-model="mainFormModalConfig.formData.description" />
        </BFormGroup>

        <BButtonGroup class="mt-3">
          <BButton variant="success" type="submit">Uložiť</BButton>
          <BButton variant="danger" @click="closeMainFormModal()">Zrušiť</BButton>
        </BButtonGroup>
      </BForm>
    </BModal>
  </template>

  <!--STATE unloaded -->
  <template v-else-if="state == 'unloaded'">
    <div class="d-grid justify-content-center my-5">
      <BSpinner label="Načítavanie..."></BSpinner>
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
        mainFormModalConfig: { show: false, formData: {}, type: null, mode: null },
        customModalConfig: null,
        expensesGroups: [],
        incomesGroups: [],
        router: useRouter(),
      };
    },
    mounted() {
      this.loadData();
    },
    methods: {
      loadData() {
        Promise.all([listExpensesGroup(), listIncomesGroup()])
          .then(([expenses, incomes]) => {
            this.expensesGroups = expenses;
            this.incomesGroups = incomes;
            this.state = "loaded";
          })
          .catch(() => { this.state = "error"; });
      },

      submitForm() {
        if (this.mainFormModalConfig.type === 'expense') {
          if (this.mainFormModalConfig.mode === 'edit') this.updateExpensesGroup();
          else this.createExpensesGroup();
        } else {
          if (this.mainFormModalConfig.mode === 'edit') this.updateIncomesGroup();
          else this.createIncomesGroup();
        }
      },

      createExpensesGroup() {
        const payload = { ...this.mainFormModalConfig.formData, id: generate24CharGUID() };
        createExpensesGroup(payload).then(() => { this.loadData(); this.closeMainFormModal(); });
      },
      updateExpensesGroup() {
        updateExpensesGroup(this.mainFormModalConfig.formData.id, this.mainFormModalConfig.formData)
          .then(() => { this.loadData(); this.closeMainFormModal(); });
      },

      createIncomesGroup() {
        const payload = { ...this.mainFormModalConfig.formData, id: generate24CharGUID() };
        createIncomesGroup(payload).then(() => { this.loadData(); this.closeMainFormModal(); });
      },
      updateIncomesGroup() {
        updateIncomesGroup(this.mainFormModalConfig.formData.id, this.mainFormModalConfig.formData)
          .then(() => { this.loadData(); this.closeMainFormModal(); });
      },

      openDeleteModal(data, type) {
        this.customModalConfig = {
          title: type === 'expense' ? 'Odstránenie skupiny výdavkov' : 'Odstránenie skupiny príjmov',
          text: `Naozaj chceš odstrániť skupinu ${data.name}?`,
          closeCallback: () => { this.customModalConfig = null; },
          buttons: [
            {
              text: 'Odstrániť',
              variant: 'btn-danger',
              callback: () => {
                const action = type === 'expense' ? deleteExpensesGroup : deleteIncomesGroup;
                action(data.id).then(() => { this.loadData(); this.customModalConfig = null; });
              }
            },
            { text: 'Zrušiť', variant: 'btn-secondary', callback: () => { this.customModalConfig = null; } }
          ]
        };
      },

      openMainFormModal(formData, mode, type) {
        Object.assign(this.mainFormModalConfig, { show: true, formData: { ...formData }, mode, type });
      },
      closeMainFormModal() {
        Object.assign(this.mainFormModalConfig, { show: false, formData: {}, mode: null, type: null });
      },

      openGroupDetail(data, type) {
        const routeName = type === 'expense' ? 'expensesGroupDetail' : 'incomesGroupDetail';
        this.router.push({ name: routeName, params: { id: data.id } });
      },
    }
  }
</script>
