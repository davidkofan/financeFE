<script setup>
  defineProps({
    modalConfig: {
      type: Object,
      required: true,
    },
  })
</script>

<template>
  <BModal :title="modalConfig.title" v-model="show" noFooter @hidden="modalConfig.closeCallback">
    <span>{{ modalConfig.text }}</span>

    <div class="d-flex justify-content-end mt-3">
      <BButtonGroup>
        <template v-for="(button, index) of modalConfig.buttons" :key="index">
          <BButton :class="`${button.variant}`" @click="button.callback">{{ button.text }} </BButton>
        </template>
      </BButtonGroup>
    </div>
  </BModal>
</template>

<script>
  export default {
    data() {
      return {
        show: true
      }
    },
  }
</script>
