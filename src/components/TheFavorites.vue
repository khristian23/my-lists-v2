<template>
  <hr />
  <span class="q-pa-md row text-h6">Favorites</span>
  <q-list>
    <q-item
      v-for="favorite in favorites"
      :key="favorite.id"
      clickable
      tag="a"
      :to="getFavoriteLink(favorite)"
    >
      <q-item-label>
        {{ favorite.name }}
      </q-item-label>
    </q-item>
  </q-list>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { useFavorites } from '@/composables/useFavorites';

export default defineComponent({
  name: 'the-favorites',
  setup() {
    const { getFavoritesRef, loadFavorites, getFavoriteLink } = useFavorites();

    const favorites = getFavoritesRef();

    onMounted(async () => {
      loadFavorites();
    });

    return {
      favorites,
      getFavoriteLink,
    };
  },
});
</script>
