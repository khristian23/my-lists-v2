<template>
  <q-page class="flex full-width row justify-center content-center">
    <q-form @submit="onLogin" style="min-width: 450px">
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
              userCredentials.protectPassword ? 'visibility_off' : 'visibility'
            "
            class="cursor-pointer"
            @click="
              userCredentials.protectPassword = !userCredentials.protectPassword
            "
          />
        </template>
      </q-input>
      <div class="row">
        <q-space />
        <q-btn elevated color="primary" type="submit">Login</q-btn>
      </div>
      <div class="q-my-md flex column content-center">
        <span class="q-my-md flex justify-center">Or</span>
        <q-btn @click="onGoogle">
          <q-img
            src="@/assets/google.png"
            alt="Login with Google"
            style="height: 28px; width: 28px; margin-right: 10px"
          />Login with Google
        </q-btn>
      </div>
    </q-form>
    <the-footer>
      <q-btn unelevated no-caps to="/register">Register</q-btn>
    </the-footer>
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
    const { replace, push } = useRouter();

    const userCredentials = reactive({
      protectPassword: true,
      email: '',
      password: '',
    });

    const {
      loginWithEmailAndPassword,
      loginWithGooglePopup,
    } = useAuthentication();

    const onLogin = async () => {
      try {
        await loginWithEmailAndPassword(
          userCredentials.email,
          userCredentials.password
        );
        emit(constants.events.showToast, 'User logged in');
        replace({ name: constants.routes.lists.name });
      } catch (e: unknown) {
        emit(constants.events.showError, (e as Error).message);
      }
    };

    const onGoogle = async () => {
      try {
        await loginWithGooglePopup();
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
