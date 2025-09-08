<script>
  import { useRouter } from 'vue-router';
  import { ref } from 'vue';
  import CustomModal from '@/components/common/CustomModal.vue';

  export default {
    components: { CustomModal },
    setup() {
      const router = useRouter();
      const customModalConfig = ref(null);
     
      const logout = () => {
        localStorage.removeItem('userToken');
        router.push('/login');
      };

      const onCloseCustomModal = () => {
        customModalConfig.value = null;
      };

      const logoutModal = () => {
        customModalConfig.value = {
          title: 'Odhlásenie',
          text: 'Naozaj sa chceš odhlásiť?',
          closeCallback: onCloseCustomModal,
          buttons: [
            { text: 'Odhlásiť', variant: 'btn-dark', callback: logout },
            { text: 'Zavrieť', variant: 'btn-secondary', callback: onCloseCustomModal }
          ]
        };
      };

      return { logoutModal, customModalConfig };
    }
  };</script>

<template>
  <BButton @click="logoutModal" variant="light">Odhlásiť</BButton>

  <CustomModal v-if="customModalConfig" :modalConfig="customModalConfig"></CustomModal>
</template>
