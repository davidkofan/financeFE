<script setup>
  import { listAccount, createAccount, updateAccount, deleteAccount } from '@/resources/services/accountsBalanceServices';
  import Balance from '@/components/admin/accountsBalance/BalanceComponent.vue';
  import CustomModal from '@/components/common/CustomModal.vue';
  import { useRouter, useRoute } from 'vue-router';
</script>

<template>
  <!-- STATE  loaded-->
  <template v-if="state == 'loaded'">
    <BButtonGroup class="mb-2">
      <BButton variant="outline-secondary" @click="goBack()">Späť</BButton>
      <BButton variant="dark" @click="openModal({}, 'mainForm', 'create')">Pridať účet</BButton>
    </BButtonGroup>

    <b-row>
      <b-col cols="12" xl="4" v-for="(data, index) in accounts" :key="index" class="mb-4">
        <BCard :header="'Účet č.' + (index + 1)"
               header-tag="header"
               :title="data.name">
          <BCard-text>{{data.description}}</BCard-text>
          <BButtonGroup>
            <BButton variant="success" @click="openModal(data,'balances', 'edit')">Správa stavu účtu</BButton>
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
      <BModal :title="modalConfig.mode === 'create' ? 'Pridať účet' : 'Upraviť účet'" v-model="modalConfig.show" noFooter @hidden="closeModal()">
        <BForm @submit.prevent="submitForm">
          <div class="row">
            <BForm-group label="Názov" label-for="name">
              <BForm-input id="name" v-model="modalConfig.formData.name" required></BForm-input>
            </BForm-group>

            <BForm-group label="Popis" label-for="description">
              <BFormTextarea id="description" v-model="modalConfig.formData.description" rows="3"></BFormTextarea>
            </BForm-group>
          </div>

          <BButtonGroup class="mt-3">
            <BButton variant="success" type="submit">Uložiť</BButton>
            <BButton variant="danger" @click="closeModal()">Zrušiť</BButton>
          </BButtonGroup>
        </BForm>
      </BModal>
    </template>

    <template v-if="modalConfig.modalType === 'balances'">
      <BModal title="Správa stavu účtu" v-model="modalConfig.show" noFooter size="lg" @hidden="closeModal()">
        <Balance :accountId="modalConfig.formData.id"></Balance>
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
        modalConfig: { show: false },
        customModalConfig: null,
        accounts: [],
        router: useRouter(),
        route: useRoute(),
      };
    },
    computed: {
      accountGroupId() {
        return this.$route.params.id
      }
    },
    created() {
      this.loadData();
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
      },
      openDeleteModal(data) {
        this.customModalConfig = {
          title: 'Odstránenie účtu',
          text: `Naozaj chceš odstrániť účet?`,
          closeCallback: () => { this.customModalConfig = null; },
          buttons: [
            {
              text: 'Odstrániť',
              variant: 'btn-danger',
              callback: () => {
                deleteAccount(data.id)
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
        this.modalConfig = Object.assign({}, { show: false });
      },
      generate24CharGUID() {
        const chars = 'abcdef0123456789';
        let guid = '';
        for (let i = 0; i < 24; i++) {
          guid += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return guid;
      },
      goBack() {
        this.router.back();
      }
    },
  }
</script>
