<template>
  <q-banner
    bordered
    inline-actions
    rounded
    class="bg-primary text-white q-ma-sm"
    v-if="showAppInstallBanner"
  >
    <strong>Install?</strong>
    <template v-slot:action>
      <q-btn
        flat
        color="white"
        class="q-px-sm"
        label="Yes"
        dense
        @click="installApp"
      />
      <q-btn
        flat
        color="white"
        class="q-px-sm"
        label="Later"
        dense
        @click="showAppInstallBanner = false"
      />
      <q-btn
        flat
        color="white"
        class="q-px-sm"
        label="Never"
        dense
        @click="neverShowAppInstallBanner"
      />
    </template>
  </q-banner>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { BeforeInstallPromptEvent } from '@/models/models';
import { getStorageBoolean, setStorageValue } from '@/composables/useCommons';
import constants from '@/util/constants';

let deferredPrompt: BeforeInstallPromptEvent;

export default defineComponent({
  name: 'the-pwa-install',
  setup() {
    const showAppInstallBanner = ref(false);
    const showAppInstallBannerKey =
      constants.storedValues.dontShowAppInstallBanner;

    onMounted(() => {
      const dontShowAppInstallBannerValue = getStorageBoolean(
        showAppInstallBannerKey
      );
      console.log(
        'dontShowAppInstallBannerValue',
        dontShowAppInstallBannerValue
      );

      if (!dontShowAppInstallBannerValue) {
        hookupBeforePWAInstallEvent();
      }
    });

    const neverShowAppInstallBanner = () => {
      showAppInstallBanner.value = false;
      setStorageValue(showAppInstallBannerKey, true);
    };

    const hookupBeforePWAInstallEvent = () => {
      console.log('beforeInstallPromtp');

      window.addEventListener('beforeinstallprompt', (e) => {
        console.log('Should how banner');

        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later
        deferredPrompt = e;
        // Update UI notify the user they can install the PWA
        showAppInstallBanner.value = true;
      });
    };

    const installApp = async () => {
      showAppInstallBanner.value = false;
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        neverShowAppInstallBanner();
      }
    };

    return {
      neverShowAppInstallBanner,
      showAppInstallBanner,
      installApp,
    };
  },
});
</script>
