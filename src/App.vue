<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useAuthentication } from '@/composables/useAuthentication';

export default defineComponent({
  name: 'App',
  setup() {
    const {
      startListeningForFirebaseChanges,
      checkForRedirectAfterAuthentication,
    } = useAuthentication();

    startListeningForFirebaseChanges();
    checkForRedirectAfterAuthentication();
  },
});
</script>
