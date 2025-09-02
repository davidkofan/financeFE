<script>
  import { useRouter } from 'vue-router';
  import { ref } from 'vue';

  export default {
    setup() {
      const router = useRouter();
      const name = ref('David');
      const password = ref('');
      const errorMessage = ref('');

      const login = async () => {
        if (password.value === 'finance') {
          router.push('/board');
          sessionStorage.setItem('userToken', 'd5sfsd165scs6dc5');

        } else {
          errorMessage.value = 'Nesprávne heslo';
        }
      };

      return { name, password, login, errorMessage };
    }
  };
</script>

<template>
  <div class="d-flex justify-content-between bg-dark text-white shadow p-2">
    <h4 class="mt-1 ms-1">Finančný portál</h4>
  </div>

  <div class="d-flex justify-content-center ">

    <div class="col-12 col-md-6 col-xl-4 mt-2 p-2">
      <h2>Prihlásenie</h2>

      <BForm @submit.prevent="login" class="p-3 border">
        <BFormGroup label="Meno" label-for="name" class="">
          <BForm-input id="name" v-model="name" required disabled></BForm-input>
        </BFormGroup>

        <BFormGroup label="Heslo" label-for="password" class="">
          <BForm-input id="password" v-model="password" required type="password"></BForm-input>
        </BFormGroup>

        <h4 class="mt-3" v-if="errorMessage">
          <b-badge variant="danger">{{ errorMessage }}</b-badge>
        </h4>

        <BButtonGroup class="mt-2">
          <BButton variant="success" type="submit">Prihlásiť</BButton>
        </BButtonGroup>
      </BForm>
    </div>

  </div>

</template>
