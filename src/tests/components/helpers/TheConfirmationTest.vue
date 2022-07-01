<template>
  <q-btn @click="openConfirmation">open</q-btn>
  <TheConfirmation ref="confirmationDialog">
    {{ message }}
  </TheConfirmation>
  <div>result: {{ confirmationResult }}</div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import TheConfirmation from '@/components/TheConfirmation.vue';

export default defineComponent({
  name: 'the-confirmation-test',
  components: { TheConfirmation },
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
