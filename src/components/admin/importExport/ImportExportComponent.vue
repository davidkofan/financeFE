<script setup>
  import CustomModal from '@/components/common/CustomModal.vue';
  //import { importData, exportData } from '@/resources/services/adminServices';
  import moment from 'moment';
</script>

<template>
  <div class="">
    <BButton @click="openExportDataModal" variant="dark" class="me-2">Exportovať dáta</BButton>
    <BButton @click="showImport = !showImport" variant="dark" class="me-2">Importovať dáta</BButton>
  </div>

  <b-collapse v-model="showImport">
    <div class="row my-2">
      <BForm-group class="col-12 col-md-9 mt-1">
        <BForm-file id="file-input"
                     v-model="importFile"
                     accept=".json"
                     :state="!!importFile"
                     placeholder="Žiadny súbor nevybraný"
                     browse-text="Vybrať súbor"></BForm-file>
      </BForm-group>

      <div class="col-12 col-md-3 mt-1">
        <BButton v-if="importFile" class="w-100" @click="importDataModal" variant="dark">Importovať</BButton>
      </div>
    </div>
  </b-collapse>

  <CustomModal v-if="modalConfig" :modalConfig="modalConfig"></CustomModal>
</template>

<script>
  export default {
    data() {
      return {
        modalConfig: null,
        importFile: null,
        showImport: false,
      }
    },
    methods: {
      importDataModal() {
        this.modalConfig = {
          title: "Importovať dáta",
          text: "Naozaj chceš importovať dáta zo súboru ?",
          closeCallback: this.onCloseCustomModal,
          buttons: [
            { text: 'Importovať', variant: 'btn-dark', callback: this.importDataHandler },
            { text: 'Zavrieť', variant: 'btn-secondary', callback: this.onCloseCustomModal }
          ]
        }
      },
      importDataHandler() {
        if (!this.importFile) return;

        const reader = new FileReader();

        reader.onload = async (event) => {
          try {
            const fileContent = event.target.result;
            const parsedData = JSON.parse(fileContent);

            const payload = {
              data: parsedData
            }

            await importData(payload)
              .then(() => {
                this.modalConfig = {
                  title: "Importované",
                  text: "Dáta zo súboru boli úspešne importované",
                  closeCallback: this.onCloseCustomModal,
                  buttons: [
                    { text: 'Zavrieť', variant: 'btn-secondary', callback: this.onCloseCustomModal }
                  ]
                }
              })
              .catch((err) => {
                console.error('import data failed', err);
              });
          } catch (err) {
            this.modalConfig = {
              title: "Chyba",
              text: "Chyba pri spracovaní importovaného súboru",
              closeCallback: this.onCloseCustomModal,
              buttons: [
                { text: 'Zavrieť', variant: 'btn-secondary', callback: this.onCloseCustomModal }
              ]
            }
            console.error('Chyba pri spracovaní importovaného súboru:', err);
          }
        };

        reader.onerror = (err) => {
          this.modalConfig = {
            title: "Chyba",
            text: "Chyba pri čítaní súboru",
            closeCallback: this.onCloseCustomModal,
            buttons: [
              { text: 'Zavrieť', variant: 'btn-secondary', callback: this.onCloseCustomModal }
            ]
          }
        };

        reader.readAsText(this.importFile);
      },
      openExportDataModal() {
        this.modalConfig = {
          title: "Exportovať dáta",
          text: "Naozaj chceš exportovať všetky dáta do súboru ?",
          closeCallback: this.onCloseCustomModal,
          buttons: [
            { text: 'Exportovať', variant: 'btn-dark', callback: this.exportDataHandler },
            { text: 'Zavrieť', variant: 'btn-secondary', callback: this.onCloseCustomModal }
          ]
        }
      },
      exportDataHandler() {
        exportData(this.filterData)
          .then(async (data) => {
            const options = {
              suggestedName: moment().format('YYYY-MM-DD HH:mm') + '_exported_data.json',
              types: [{
                description: 'JSON Files',
                accept: { 'application/json': ['.json'] }
              }]
            };

            try {
              const handle = await window.showSaveFilePicker(options);
              const writable = await handle.createWritable();
              await writable.write(JSON.stringify(data, null, 2));
              await writable.close();
              this.onCloseCustomModal();
            } catch (err) {
              console.error('Save failed', err);
            }
          })
          .catch((err) => {
            console.error('fetch exportData failed', err);
          });
      },
      onCloseCustomModal() {
        this.modalConfig = null;
      },
    },
  }
</script>
