<template>
  <q-dialog v-model="openConfirmation" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-icon
          name="contact_support"
          color="primary"
          style="font-size: 2rem"
        />
        <span class="q-ml-sm"><slot /></span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          label="No"
          color="primary"
          @click="onNo"
          v-close-popup
        ></q-btn>
        <q-btn
          flat
          label="Yes"
          color="primary"
          @click="onYes"
          v-close-popup
        ></q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'the-confirmation',
  setup(_, { expose }) {
    const openConfirmation = ref(false);
    let resolveConfirm: (value: boolean) => void;

    const onYes = () => {
      openConfirmation.value = false;
      resolveConfirm(true);
    };

    const onNo = () => {
      openConfirmation.value = false;
      resolveConfirm(false);
    };

    const showDialog = () => {
      return new Promise<boolean>((resolve) => {
        resolveConfirm = resolve;
        openConfirmation.value = true;
      });
    };

    expose({ showDialog });

    return {
      openConfirmation,
      onYes,
      onNo,
      showDialog,
    };
  },
});
</script>
