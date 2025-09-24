<script setup>
  import { listAccountGroup, createAccountGroup, updateAccountGroup, deleteAccountGroup } from '@/resources/services/accountsBalanceServices';
  import { generate24CharGUID } from '@/resources/globalFunctions';
  import ExpectedIncreases from '@/components/admin/accountsBalance/ExpectedIncreases.vue';
  import CustomModal from '@/components/common/CustomModal.vue';
  import { useRouter, useRoute } from 'vue-router';
</script>

<template>
  <!-- STATE  loaded-->
  <template v-if="state == 'loaded'">
    <BButtonGroup class="mb-2">
      <BButton variant="dark" @click="openModal({},'mainForm', 'create')">Pridať skupinu účtov</BButton>
    </BButtonGroup>

    <b-row>
      <b-col cols="12" xl="4" v-for="(data, index) in accountGroups" :key="index" class="mb-4">
        <BCard :header="'Skupina účtov č.' + (index + 1)"
               header-tag="header"
               :title="data.name">
          <BCard-text>{{data.description}}</BCard-text>
          <BButtonGroup>
            <BButton variant="success" @click="openAccountsGroupDetail(data)">Správa účtov</BButton>
            <BButton variant="outline-success" @click="openModal(data, 'expectedIncreases', 'edit')">Správa predpokladov</BButton>
          </BButtonGroup>

          <template #footer>
            <BButtonGroup>
              <BButton variant="primary" @click="openModal(data,'mainForm', 'edit')">Konfigurácia</BButton>
              <BButton variant="danger" @click="openDeleteModal(data)">Odstránenie</BButton>
            </BButtonGroup>
          </template>
        </BCard>
      </b-col>
    </b-row>

    <template v-if="modalConfig.modalType === 'mainForm'">
      <BModal :title="modalConfig.mode === 'create' ? 'Pridať skupinu účtov' : 'Upraviť skupinu účtov'" v-model="modalConfig.show" noFooter @hidden="closeModal()">
        <BForm @submit.prevent="submitForm">
          <div class="row">
            <BFormGroup label="Názov" label-for="name">
              <BForm-input id="name" v-model="modalConfig.formData.name" required></BForm-input>
            </BFormGroup>

            <BFormGroup label="Popis" label-for="description">
              <BFormTextarea id="description" v-model="modalConfig.formData.description" rows="3"></BFormTextarea>
            </BFormGroup>
          </div>

          <BButtonGroup class="mt-3">
            <BButton variant="success" type="submit">Uložiť</BButton>
            <BButton variant="danger" @click="closeModal()">Zrušiť</BButton>
          </BButtonGroup>
        </BForm>
      </BModal>
    </template>

    <template v-if="modalConfig.modalType === 'expectedIncreases'">
      <BModal title="Správa predpokladaných príjmov" v-model="modalConfig.show" noFooter size="lg" @hidden="closeModal()">
        <ExpectedIncreases :groupId="modalConfig.formData.id"></ExpectedIncreases>
      </BModal>
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
        accountGroups: [],
        router: useRouter(),
        route: useRoute(),
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
          id: generate24CharGUID()
        };
        createAccountGroup(payload)
          .then(() => {
            this.loadData();
            this.closeModal();
          })
      },
      updateAccountGroup() {
        updateAccountGroup(this.modalConfig.formData.id, this.modalConfig.formData)
          .then(() => {
            this.loadData();
            this.closeModal();
          })
      },
      openDeleteModal(data) {
        this.customModalConfig = {
          title: 'Odstránenie skupiny účtov',
          text: `Naozaj chceš odstrániť skupinu účtov ${data.name}?`,
          closeCallback: () => { this.customModalConfig = null; },
          buttons: [
            {
              text: 'Odstrániť',
              variant: 'btn-danger',
              callback: () => {
                deleteAccountGroup(data.id)
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
      openAccountsGroupDetail(data) {
        this.router.push({ name: 'accountsGroupDetail', params: { id: data.id } });
      },
    },
  }
</script>
