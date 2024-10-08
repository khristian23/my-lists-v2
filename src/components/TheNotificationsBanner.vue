<template>
  <q-page-sticky position="top-right" :offset="[18, 18]">
  <q-banner
    bordered
    rounded
    class="bg-grey-2 q-ma-sm q-mb-md text-black"
    v-if="showNotificationsBanner && pushNotificationsSupported && user.isLoggedIn"
  >
    
    <div><q-icon name="notifications" class="q-mr-sm" />Would you like to enable notifications?</div>
    <template v-slot:action>
      <q-btn
        flat
        color="primary"
        class="q-px-sm"
        label="Yes"
        dense
        @click="enableNotifications"
      />
      <q-btn
        flat
        color="primary"
        class="q-px-sm"
        label="Later"
        dense
        @click="showNotificationsBanner = false"
      />
      <q-btn
        flat
        color="primary"
        class="q-px-sm"
        label="Never"
        dense
        @click="neverShowNotificationsBanner"
      />
    </template>
  </q-banner>
  </q-page-sticky>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { BeforeInstallPromptEvent } from '@/models/models';
import { getStorageBoolean, setStorageValue } from '@/composables/useCommons';
import { useUser } from '@/composables/useUser';
import { useServiceWorker } from '@/composables/useServiceWorker';
import constants from '@/util/constants';

export default defineComponent({
  name: 'the-notifications-banner',
  setup() {
    const { getCurrentUserRef } = useUser();
    const { triggerPushNotification } = useServiceWorker();
    const showNotificationsBanner = ref(false);
    const pushNotificationsSupported = ref(false);
    const dontShowNotificationsBannerKey = constants.storedValues.dontShowNotificationsBanner;

    onMounted(() => {
      showNotificationsBanner.value = !getStorageBoolean(dontShowNotificationsBannerKey);

      pushNotificationsSupported.value = ('PushManager' in window);
    });

    const neverShowNotificationsBanner = () => {
      showNotificationsBanner.value = false;
      setStorageValue(dontShowNotificationsBannerKey, true);
    };

    const enableNotifications = async () => {
      if (pushNotificationsSupported.value) {
        Notification.requestPermission(result => {
          neverShowNotificationsBanner();

          if (result === 'granted') {
            triggerPushNotification();
          }
        });
      }
    };

    return {
      neverShowNotificationsBanner,
      showNotificationsBanner,
      enableNotifications,
      pushNotificationsSupported,
      user: getCurrentUserRef(),
    };
  },
});
</script>
