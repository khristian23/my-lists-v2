<template>
  <q-btn @click="openConfirmation">open</q-btn>
  <the-confirmation ref="confirmationDialog">
    {{ message }}
  </the-confirmation>
  <div>result: {{ confirmationResult }}</div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'the-confirmation-test',
  props: {
    message: String,
  },
  setup() {
    const confirmationDialog = ref();
    const confirmationResult = ref('');

    const openConfirmation = async () => {
      if (confirmationDialog.value) {
        const result = await confirmationDialog.value.showDialog();
        confirmationResult.value = result ? 'true' : 'false';
      }
    };

    return {
      openConfirmation,
      confirmationResult,
      confirmationDialog,
    };
  },
});
</script>
