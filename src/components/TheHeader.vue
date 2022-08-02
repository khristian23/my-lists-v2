<template>
  <q-toolbar>
    <q-btn
      flat
      dense
      round
      icon="menu"
      aria-label="Menu"
      @click="$emit('toggle-drawer')"
      :show-if-above="false"
    />
    <q-btn
      flat
      dense
      round
      icon="arrow_back_ios"
      aria-label="Back"
      class="q-ml-sm"
      v-if="displayHeaderBackButton"
      @click="$router.go(-1)"
    />

    <q-toolbar-title class="absolute-center" style="max-width: 60%">
      {{ title }}
    </q-toolbar-title>

    <q-space />

    <q-btn
      v-if="!user.isLoggedIn"
      to="/login"
      flat
      dense
      icon="account_circle"
      no-caps
      aria-label="Login"
    />
    <q-btn round dense v-if="user.isLoggedIn" to="/profile">
      <q-avatar size="38px">
        <img
          v-if="user.photoURL"
          :src="user.photoURL"
          style="object-fit: cover"
          alt="User avatar"
        />
        <span v-else>{{ user.initials }}</span>
      </q-avatar>
    </q-btn>
  </q-toolbar>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useUser } from '@/composables/useUser';
import { useGlobals } from '@/composables/useGlobals';

export default defineComponent({
  name: 'the-header',
  props: ['customTitle'],
  setup() {
    const { user } = useUser();
    const { title, displayHeaderBackButton } = useGlobals();

    return {
      user,
      title,
      displayHeaderBackButton,
    };
  },
});
</script>
