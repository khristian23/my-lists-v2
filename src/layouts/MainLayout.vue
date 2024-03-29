<template>
  <q-layout view="hHh Lpr lFf">
    <q-header elevated class="bg-primary">
      <the-header @toggle-drawer="leftDrawerOpen = !leftDrawerOpen" />
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header class="text-grey-8">
          <q-chip clickable @click="onUserNameClicked">
            <q-avatar color="blue" text-color="white">{{
              user.initials
            }}</q-avatar>
            {{ user.name }}
          </q-chip>
        </q-item-label>
        <the-menu-link
          v-for="link in menuLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
      <the-favorites />
      <the-pwa-install />
    </q-drawer>

    <q-page-container>
      <router-view @showError="showError" @showToast="showToast" />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue';
import Consts from '@/util/constants';
import { useRouter } from 'vue-router';
import { useUser } from '@/composables/useUser';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'main-layout',
  setup() {
    const leftDrawerOpen = ref(false);
    const router = useRouter();
    const { getCurrentUserRef } = useUser();
    const quasar = useQuasar();

    const menuLinks = reactive([
      {
        title: 'All Lists',
        icon: 'select_all',
        link: '/',
      },
    ]);
    menuLinks.push(
      ...Consts.lists.types.map((type) => {
        return {
          title: type.label,
          icon: type.icon,
          link: `/?type=${type.value}`,
        };
      })
    );

    const showError = (message: string) => {
      quasar.notify({
        message: message,
        type: 'negative',
      });
    };

    const showToast = (message: string) => {
      quasar.notify({
        message: message,
        color: 'gray',
      });
    };

    const onUserNameClicked = () => {
      router.push({ name: Consts.routes.profile.name });
    };

    return {
      user: getCurrentUserRef(),
      leftDrawerOpen,
      menuLinks,
      showError,
      showToast,
      onUserNameClicked,
    };
  },
});
</script>
