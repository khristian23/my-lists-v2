<template>
  <q-page>
    <q-form ref="registrarForm" class="q-pa-md">
      <q-input
        outlined
        lazy-rules
        v-model="userRegistrar.name"
        label="Name"
        :rules="[(val) => (val && val.length > 0) || 'Please enter a name']"
        class="q-mb-sm"
      />
      <q-input
        outlined
        lazy-rules
        v-model="userRegistrar.email"
        label="Email"
        type="email"
        :rules="[isValidEmail]"
        class="q-mb-sm"
      />
      <q-input
        outlined
        label="Password"
        v-model="userRegistrar.password"
        lazy-rules
        :type="protectPassword ? 'password' : 'text'"
        :rules="[isValidPassword]"
        class="q-mb-sm"
      >
        <template v-slot:append>
          <q-icon
            :name="protectPassword ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="protectPassword = !protectPassword"
          />
        </template>
      </q-input>
      <q-input
        outlined
        label="Confirm Password"
        v-model="userRegistrar.confirmation"
        lazy-rules
        :type="protectConfirmation ? 'password' : 'text'"
        :rules="[
          (val) => (val && val.length > 0) || 'Please confirm password',
          isEqualToPassword,
        ]"
      >
        <template v-slot:append>
          <q-icon
            :name="protectConfirmation ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="protectConfirmation = !protectConfirmation"
          />
        </template>
      </q-input>
    </q-form>
    <the-footer>
      <q-btn unelevated to="/login">Back to Login</q-btn>
      <q-btn unelevated @click="onRegister">sign Up</q-btn>
    </the-footer>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import UserRegistrar from '@/models/userRegistrar';
import { useRouter } from 'vue-router';
import constants from '@/util/constants';
import { QForm } from 'quasar';
import { useAuthentication } from '@/composables/useAuthentication';

export default defineComponent({
  name: 'register-page',
  emits: [constants.events.showToast, constants.events.showError],
  setup(_, { emit }) {
    const router = useRouter();
    const registrarForm = ref<QForm | null>(null);
    const userRegistrar = ref(new UserRegistrar());
    const { registerUser } = useAuthentication();

    const isValidEmail = (): boolean | string => {
      try {
        return userRegistrar.value.isEmailValid();
      } catch (e: unknown) {
        return (e as Error).message;
      }
    };

    const isEqualToPassword = () => {
      try {
        return userRegistrar.value.isPasswordConfirmed();
      } catch (e: unknown) {
        return (e as Error).message;
      }
    };

    const isValidPassword = (): boolean | string => {
      try {
        return userRegistrar.value.isPasswordValid();
      } catch (e: unknown) {
        return (e as Error).message;
      }
    };

    const onLogin = () => router.replace({ name: constants.routes.login.name });

    const onRegister = async () => {
      const isValid = await registrarForm?.value?.validate();
      if (!isValid) {
        return;
      }

      try {
        await registerUser(userRegistrar.value);
        emit(constants.events.showToast, 'User registered');
        router.replace({ name: constants.routes.lists.name });
      } catch (e: unknown) {
        emit(constants.events.showError, (e as Error).message);
      }
    };

    return {
      registrarForm,
      protectPassword: true,
      protectConfirmation: true,
      userRegistrar,
      isValidEmail,
      isEqualToPassword,
      isValidPassword,
      onRegister,
      onLogin,
    };
  },
});
</script>
