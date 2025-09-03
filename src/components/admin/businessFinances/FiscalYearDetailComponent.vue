<script setup>
  import { listMonthlyBalance, createMonthlyBalance, updateMonthlyBalance, deleteMonthlyBalance, updateFinancialYear } from '@/resources/services/businessFinancesServices';
  import { generate24CharGUID } from '@/resources/globalFunctions';
  import CustomModal from '@/components/common/CustomModal.vue';
  import { useRouter, useRoute } from 'vue-router';
</script>

<template>
  <!-- STATE  loaded-->
  <template v-if="state == 'loaded'">
    <BButtonGroup class="mb-2">
      <BButton variant="outline-secondary" @click="goBack()">Späť</BButton>
    </BButtonGroup>

    <h3>Správa fakturácií - fiškálny rok {{financialYear.name}}</h3>
    <h6>{{financialYear.description}}</h6>

    <BCard header="Doplatky"
           header-tag="header">
      <BListGroup>
        <BListGroupItem variant="dark">Daň: {{ `${Number(financialYear.additionalTax).toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €` }} {{ financialYear.additionalTaxAssumption ? '❓' : '' }}</BListGroupItem>
        <BListGroupItem variant="dark">Zdravotné poistenie: {{ `${Number(financialYear.additionalHealthInsurance).toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €` }} {{ financialYear.additionalHealthInsuranceAssumption ? '❓' : '' }}</BListGroupItem>
        <BListGroupItem variant="dark">Sociálne poistenie: {{ `${Number(financialYear.additionalSocialInsurance).toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €` }} {{ financialYear.additionalSocialInsuranceAssumption ? '❓' : '' }}</BListGroupItem>
      </BListGroup>

      <template #footer>
        <BButtonGroup>
          <BButton variant="success" @click="openModal(financialYear,'mainForm', 'edit')">Správa doplatkov</BButton>
        </BButtonGroup>
      </template>
    </BCard>

    <BButtonGroup class="my-3">
      <BButton variant="dark" @click="openModal({}, 'monthlyBalanceForm', 'create')">Pridať mesačný prehľad</BButton>
    </BButtonGroup>

    <b-row>
      <b-col cols="12" xl="4" v-for="(data, index) in monthlyBalances" :key="index" class="mb-4">
        <BCard :header="'Mesačný prehľad č.' + (index + 1)"
               header-tag="header"
               :title="monthOptions.find(month => month.value == data.month).text">

          <BListGroup>
            <BListGroupItem variant="success">Príjem: {{ `${Number(data.income).toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €` }} {{ data.incomeAssumption ? '❓' : '' }}</BListGroupItem>
            <BListGroupItem variant="dark">Daň: {{ `${Number(data.tax).toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €` }} {{ data.taxAssumption ? '❓' : '' }}</BListGroupItem>
            <BListGroupItem variant="dark">Zdravotné poistenie: {{ `${Number(data.healthInsurance).toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €` }} {{ data.healthInsuranceAssumption ? '❓' : '' }}</BListGroupItem>
            <BListGroupItem variant="dark">Sociálne poistenie: {{ `${Number(data.socialInsurance).toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €` }} {{ data.socialInsuranceAssumption ? '❓' : '' }}</BListGroupItem>
          </BListGroup>

          <BButtonGroup class="mt-3">
            <BButton variant="success" @click="openModal(data,'monthlyBalanceForm', 'edit')">Správa mesačného prehľadu</BButton>
          </BButtonGroup>

          <template #footer>
            <BButtonGroup>
              <BButton variant="danger" @click="openDeleteModal(data)">Odstránenie</BButton>
            </BButtonGroup>
          </template>
        </BCard>
      </b-col>
    </b-row>

    <template v-if="modalConfig.modalType === 'mainForm'">
      <BModal title="Upraviť doplatky" v-model="modalConfig.show" noFooter @hidden="closeModal()">
        <BForm @submit.prevent="submitMainForm">
          <BRow>
            <BCol cols="8">
              <BFormGroup label="Daň" label-for="tax">
                <BForm-input id="tax" v-model="modalConfig.formData.additionalTax" type="number" required></BForm-input>
              </BFormGroup>
            </BCol>

            <BCol cols="4">
              <BFormGroup label="Predpoklad" label-for="additionalTaxAssumption">
                <BFormCheckbox id="additionalTaxAssumption" v-model="modalConfig.formData.additionalTaxAssumption" switch></BFormCheckbox>
              </BFormGroup>
            </BCol>
          </BRow>

          <BRow>
            <BCol cols="8">
              <BFormGroup label="Zdravotné poistenie" label-for="healthInsurance">
                <BForm-input id="healthInsurance" v-model="modalConfig.formData.additionalHealthInsurance" type="number" required></BForm-input>
              </BFormGroup>
            </BCol>
            <BCol cols="4">
              <BFormGroup label="Predpoklad" label-for="additionalHealthInsuranceAssumption">
                <BFormCheckbox id="additionalHealthInsuranceAssumption" v-model="modalConfig.formData.additionalHealthInsuranceAssumption" switch></BFormCheckbox>
              </BFormGroup>
            </BCol>
          </BRow>

          <BRow>
            <BCol cols="8">
              <BFormGroup label="Sociálne poistenie" label-for="socialInsurance">
                <BForm-input id="socialInsurance" v-model="modalConfig.formData.additionalSocialInsurance" type="number" required></BForm-input>
              </BFormGroup>
            </BCol>
            <BCol cols="4">
              <BFormGroup label="Predpoklad" label-for="additionalSocialInsuranceAssumption">
                <BFormCheckbox id="additionalSocialInsuranceAssumption" v-model="modalConfig.formData.additionalSocialInsuranceAssumption" switch></BFormCheckbox>
              </BFormGroup>
            </BCol>
          </BRow>

          <BButtonGroup class="mt-3">
            <BButton variant="success" type="submit">Uložiť</BButton>
            <BButton variant="danger" @click="closeModal()">Zrušiť</BButton>
          </BButtonGroup>
        </BForm>
      </BModal>
    </template>


    <template v-if="modalConfig.modalType === 'monthlyBalanceForm'">
      <BModal :title="modalConfig.mode === 'create' ? 'Pridať mesačný prehľad' : 'Upraviť mesačný prehľad'" v-model="modalConfig.show" noFooter @hidden="closeModal()">
        <BForm @submit.prevent="submitMonthlyBalanceForm">
          <BRow>
            <BFormGroup label="Mesiac" label-for="month">
              <BForm-select id="month" v-model="modalConfig.formData.month" :options="monthOptions" required />
            </BFormGroup>
          </BRow>

          <BRow>
            <BCol cols="8">
              <BFormGroup label="Príjem" label-for="income">
                <BForm-input id="income" v-model="modalConfig.formData.income" type="number" required></BForm-input>
              </BFormGroup>
            </BCol>

            <BCol cols="4">
              <BFormGroup label="Predpoklad" label-for="incomeAssumption">
                <BFormCheckbox id="incomeAssumption" v-model="modalConfig.formData.incomeAssumption" switch></BFormCheckbox>
              </BFormGroup>
            </BCol>
          </BRow>

          <BRow>
            <BCol cols="8">
              <BFormGroup label="Daň" label-for="tax">
                <BForm-input id="tax" v-model="modalConfig.formData.tax" type="number" required></BForm-input>
              </BFormGroup>
            </BCol>

            <BCol cols="4">
              <BFormGroup label="Predpoklad" label-for="taxAssumption">
                <BFormCheckbox id="taxAssumption" v-model="modalConfig.formData.taxAssumption" switch></BFormCheckbox>
              </BFormGroup>
            </BCol>
          </BRow>

          <BRow>
            <BCol cols="8">
              <BFormGroup label="Zdravotné poistenie" label-for="healthInsurance">
                <BForm-input id="healthInsurance" v-model="modalConfig.formData.healthInsurance" type="number" required></BForm-input>
              </BFormGroup>
            </BCol>

            <BCol cols="4">
              <BFormGroup label="Predpoklad" label-for="healthInsuranceAssumption">
                <BFormCheckbox id="healthInsuranceAssumption" v-model="modalConfig.formData.healthInsuranceAssumption" switch></BFormCheckbox>
              </BFormGroup>
            </BCol>
          </BRow>

          <BRow>
            <BCol cols="8">
              <BFormGroup label="Sociálne poistenie" label-for="socialInsurance">
                <BForm-input id="socialInsurance" v-model="modalConfig.formData.socialInsurance" type="number" required></BForm-input>
              </BFormGroup>
            </BCol>

            <BCol cols="4">
              <BFormGroup label="Predpoklad" label-for="socialInsuranceAssumption">
                <BFormCheckbox id="socialInsuranceAssumption" v-model="modalConfig.formData.socialInsuranceAssumption" switch></BFormCheckbox>
              </BFormGroup>
            </BCol>
          </BRow>

          <BRow>
            <BFormGroup label="Popis" label-for="description">
              <BFormTextarea id="description" v-model="modalConfig.formData.description" rows="3"></BFormTextarea>
            </BFormGroup>
          </BRow>

          <BButtonGroup class="mt-3">
            <BButton variant="success" type="submit">Uložiť</BButton>
            <BButton variant="danger" @click="closeModal()">Zrušiť</BButton>
          </BButtonGroup>
        </BForm>
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
        monthlyBalances: [],
        financialYear: {},
        router: useRouter(),
        route: useRoute(),
        monthOptions: [
          { value: '1', text: '1 - Január' },
          { value: '2', text: '2 - Február' },
          { value: '3', text: '3 - Marec' },
          { value: '4', text: '4 - Apríl' },
          { value: '5', text: '5 - Máj' },
          { value: '6', text: '6 - Jún' },
          { value: '7', text: '7 - Júl' },
          { value: '8', text: '8 - August' },
          { value: '9', text: '9 - September' },
          { value: '10', text: '10 - Október' },
          { value: '11', text: '11 - November' },
          { value: '12', text: '12 - December' }
        ],
      };
    },
    computed: {
      financialYearId() {
        return this.$route.params.id
      }
    },
    created() {
      this.loadData();
    },
    methods: {
      loadData() {
        listMonthlyBalance(this.financialYearId)
          .then((response) => {
            this.monthlyBalances = response.monthlyBalances;
            this.financialYear = response.financialYear;
            this.state = "loaded";
          })
          .catch(() => {
            this.state = "error";
          });

      },
      submitMainForm() {
        updateFinancialYear(this.financialYearId, this.modalConfig.formData)
          .then(() => {
            this.loadData();
            this.closeModal();
          })
      },
      submitMonthlyBalanceForm() {
        if (this.modalConfig.mode === 'edit') {
          this.updateMonthlyBalance();
        } else {
          this.createMonthlyBalance();
        }
      },
      createMonthlyBalance() {
        const payload = {
          ...this.modalConfig.formData,
          financialYearId: this.financialYearId,
          id: generate24CharGUID()
        };
        createMonthlyBalance(payload)
          .then(() => {
            this.loadData();
            this.closeModal();
          })
      },
      updateMonthlyBalance() {
        const payload = {
          ...this.modalConfig.formData,
          groupId: this.financialYearId,
        };
        updateMonthlyBalance(this.modalConfig.formData.id, payload)
          .then(() => {
            this.loadData();
            this.closeModal();
          })
      },
      openDeleteModal(data) {
        this.customModalConfig = {
          title: 'Odstránenie mesačného prehľadu',
          text: `Naozaj chceš odstrániť mesačný prehľad?`,
          closeCallback: () => { this.customModalConfig = null; },
          buttons: [
            {
              text: 'Odstrániť',
              variant: 'btn-danger',
              callback: () => {
                deleteMonthlyBalance(data.id)
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
      goBack() {
        this.router.back();
      }
    },
  }
</script>
