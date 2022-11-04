<template>
  <q-page class="flex">
    <q-card class="full-width q-pa-md">
      <q-tabs
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="email" label="Email" />
        <q-tab name="google" label="Google" />
      </q-tabs>

      <q-separator />

      <q-tab-panels animated>
        <q-tab-panel name="email">
          <q-form @submit="onLogin">
            <q-input
              outlined
              v-model="userCredentials.email"
              type="email"
              label="Email"
              lazy-rules
              :rules="[ (val: string) => val && val.length > 0 || 'Please enter an email']"
            />
            <q-input
              outlined
              v-model="userCredentials.password"
              :type="userCredentials.protectPassword ? 'password' : 'text'"
              label="Password"
              lazy-rules
              :rules="[ (val: string) => val && val.length > 0 || 'Please enter password']"
            >
              <template v-slot:append>
                <q-icon
                  :name="
                    userCredentials.protectPassword
                      ? 'visibility_off'
                      : 'visibility'
                  "
                  class="cursor-pointer"
                  @click="
                    userCredentials.protectPassword =
                      !userCredentials.protectPassword
                  "
                />
              </template>
            </q-input>
            <div class="row">
              <q-space />
              <q-btn elevated color="primary" type="submit">Login</q-btn>
            </div>
          </q-form>
        </q-tab-panel>

        <q-tab-panel name="google">
          <div class="fixed-center">
            <a @click="onGoogle" style="cursor: pointer">
              <q-img
                src="@/assets/google.png"
                style="height: 180px; width: 180px"
              />
            </a>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
    <TheFooter>
      <q-btn unelevated to="/register">Register</q-btn>
    </TheFooter>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthentication } from '@/composables/useAuthentication';
import constants from '@/util/constants';

export default defineComponent({
  name: 'login-user',
  setup(_, { emit }) {
    const { replace } = useRouter();

    const userCredentials = reactive({
      protectPassword: true,
      email: '',
      password: '',
    });

    const { loginWithEmailAndPassword, loginWithGoogleRedirect } =
      useAuthentication();

    const onLogin = async () => {
      try {
        await loginWithEmailAndPassword(
          userCredentials.email,
          userCredentials.password
        );
        emit(constants.events.showToast, 'User logged in');
        replace({ name: constants.routes.lists });
      } catch (e: unknown) {
        emit(constants.events.showError, (e as Error).message);
      }
    };

    const onGoogle = async () => {
      try {
        await loginWithGoogleRedirect();
        // this.checkForRedirectAfterAuth();
      } catch (e: unknown) {
        emit(constants.events.showError, (e as Error).message);
      }
    };

    return {
      userCredentials,
      onLogin,
      onGoogle,
    };
  },
});
</script>
