<template>
  <q-layout view="lhh LpR fff" container style="height: 500px">
    <slot></slot>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'the-page-layout-test',
});
</script>
