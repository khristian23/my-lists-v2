<template>
  <q-layout view="lHh Lpr lFf">
    <span>title: {{ title }}</span>
    <q-page-container>
      <router-view
        @show-error="showErrorEmitted"
        @show-toast="showToastEmitted"
      />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useGlobals } from '@/composables/useGlobals';
import constants from '@/util/constants';

export default defineComponent({
  name: 'main-layout-test',
  emits: [constants.events.showError, constants.events.showToast],
  setup(_, { emit }) {
    const { title } = useGlobals();

    return {
      title,
      showErrorEmitted: (message: string) => {
        emit(constants.events.showError, message);
      },
      showToastEmitted: (message: string) => {
        emit(constants.events.showToast, message);
      },
    };
  },
});
</script>
