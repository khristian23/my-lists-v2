<template>
  <q-page class="flex">
    <q-form class="full-width q-pa-md">
      <q-input
        outlined
        v-model="registration.name"
        label="Name"
        readonly
        class="q-mb-md"
      />
      <q-input
        outlined
        v-model="registration.email"
        label="Email"
        readonly
        class="q-mb-md"
      />
      <q-input
        outlined
        v-model="registration.location"
        label="Location"
        class="q-mb-md"
        :loading="isLoadingLocation"
      >
        <template v-slot:append>
          <q-btn
            round
            dense
            flat
            icon="near_me"
            @click="getLocation()"
            v-if="!isLoadingLocation && isLocationSupported"
          />
        </template>
      </q-input>
    </q-form>
    <the-footer>
      <q-btn unelevated :to="$Consts.routes.camera.name">Change Picture</q-btn>
      <q-btn unelevated @click="onLogout">Logout</q-btn>
    </the-footer>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, computed, reactive } from 'vue';
import { useUser } from '@/composables/useUser';
import constants from '@/util/constants';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'profile-page',
  emits: [constants.events.showError, constants.events.showToast],
  setup(_, { emit }) {
    const { logoutUser, setUserLocation } = useUser();
    const { replace } = useRouter();
    const isLoadingLocation = ref(false);

    const registration = reactive({
      name: '',
      email: '',
      location: '',
    });

    const isLocationSupported = computed(() => {
      return 'geolocation' in navigator;
    });

    const onLogout = async () => {
      try {
        await logoutUser();
        emit(constants.events.showToast, 'User Logged out');
        replace({ name: constants.routes.login.name });
      } catch (e: unknown) {
        emit(constants.events.showError, (e as Error).message);
      }
    };

    const getCityAndCountryFromPosition = async (
      position: GeolocationPosition
    ) => {
      const apiUrl = `https://geocode.xyz/${position.coords.latitude},${position.coords.longitude}?json=1`;

      try {
        isLoadingLocation.value = true;

        const response = await fetch(apiUrl);
        const data = await response.json();

        let location = data.city;
        if (data.country) {
          location += `, ${data.country}`;
        }

        setUserLocation(location);
      } catch (e: unknown) {
        emit(constants.events.showError, (e as Error).message);
      } finally {
        isLoadingLocation.value = false;
      }
    };

    const getLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => getCityAndCountryFromPosition(position),
        (error) => emit(constants.events.showError, error.message),
        { timeout: 5000 }
      );
    };

    return {
      registration,
      isLoadingLocation,
      isLocationSupported,
      onLogout,
      getLocation,
    };
  },
});
</script>
