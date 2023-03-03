<template>
  <span>Favorites</span>
  <q-list>
    <q-item v-for="favorite in favorites" :key="favorite.id">
      <q-item-label>
        {{ favorite.name }}
      </q-item-label>
    </q-item>
  </q-list>
</template>

<script>
import { defineComponent, onMounted } from 'vue';
import { useFavorites } from '@/composables/useFavorites';

export default defineComponent({
  name: 'the-favorites',
  setup() {
    const { getFavoritesRef, loadFavorites } = useFavorites();

    const favorites = getFavoritesRef();

    onMounted(async () => {
      loadFavorites();
    });

    return {
      favorites,
    };
  },
});
</script>
