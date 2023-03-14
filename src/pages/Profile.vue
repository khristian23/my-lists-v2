<template>
  <q-page class="flex">
    <q-form class="full-width q-pa-md">
      <q-input
        outlined
        v-model="user.name"
        label="Name"
        readonly
        class="q-mb-md"
      />
      <q-input
        outlined
        v-model="user.email"
        label="Email"
        readonly
        class="q-mb-md"
      />
      <q-input
        outlined
        v-model="user.location"
        label="Location"
        class="q-mb-md"
        :loading="isLoadingLocation"
      >
        <template v-slot:append>
          <q-btn
            aria-label="Get Location"
            round
            dense
            flat
            icon="near_me"
            @click="getLocation()"
            v-if="!isLoadingLocation && isGeolocationAvailable()"
          />
        </template>
      </q-input>
    </q-form>
    <the-footer>
      <q-btn unelevated no-caps @click="onLogout">Logout</q-btn>
    </the-footer>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useUser } from '@/composables/useUser';
import { useAuthentication } from '@/composables/useAuthentication';
import constants from '@/util/constants';
import { useRouter } from 'vue-router';
import {
  isGeolocationAvailable,
  getCurrentCityWithCountry,
} from '@/services/LocationService';

export default defineComponent({
  name: 'profile-page',
  emits: [constants.events.showError, constants.events.showToast],
  setup(_, { emit }) {
    const { setUserLocation, getCurrentUserRef } = useUser();
    const { logoutUser } = useAuthentication();
    const { replace } = useRouter();
    const isLoadingLocation = ref(false);

    const user = getCurrentUserRef();

    const getLocation = async () => {
      try {
        isLoadingLocation.value = true;
        const location = await getCurrentCityWithCountry();
        setUserLocation(location);
      } catch (e: unknown) {
        emit(constants.events.showError, (e as Error).message);
      } finally {
        isLoadingLocation.value = false;
      }
    };

    const onLogout = () => {
      try {
        logoutUser();
        emit(constants.events.showToast, 'User Logged out');
        replace({ name: constants.routes.login.name });
      } catch (e: unknown) {
        emit(constants.events.showError, (e as Error).message);
      }
    };

    return {
      user,
      isLoadingLocation,
      isGeolocationAvailable,
      getLocation,
      onLogout,
    };
  },
});
</script>
