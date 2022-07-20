<template>
  <q-layout view="lHh Lpr lFf">
    <span>title: {{ title }}</span>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useGlobals } from '@/composables/useGlobals';

export default defineComponent({
  name: 'main-layout-test',
  setup() {
    const { title } = useGlobals();

    return {
      title,
    };
  },
});
</script>
