<template>
  <q-footer bordered class="primary text-white">
    <q-toolbar>
      <q-space />
      <slot></slot>
    </q-toolbar>
  </q-footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'the-footer',
});
</script>
