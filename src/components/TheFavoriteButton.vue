<template>
  <q-btn
    dense
    flat
    @click="onFavorite"
    :class="favoriteColor"
    icon="favorite"
    no-caps
  />
  <span
    class="relative-position text-white text-body2 text-weight-medium"
    style="cursor: pointer"
    v-ripple
    @click="onFavorite"
    >Favorite</span
  >
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'the-favorite-button',
  props: ['favorite'],
  emits: ['click'],
  setup(props, { emit }) {
    const favoriteColor = computed(() => (props.favorite ? 'is-favorite' : ''));

    const onFavorite = () => emit('click');

    return {
      favoriteColor,
      onFavorite,
    };
  },
});
</script>

<style>
.is-favorite {
  color: red;
}
</style>
