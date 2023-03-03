import { ref } from 'vue';
import { useUser } from '@/composables/useUser';
import { useListables } from '@/composables/useListables';

const favorites = ref<Array<{ [k: string]: string }>>([]);

export function useFavorites() {
  const { getCurrentUserRef } = useUser();
  const { getCurrentLists } = useListables();

  const getFavoritesRef = () => {
    return favorites;
  };

  const loadFavorites = () => {
    const user = getCurrentUserRef().value;

    if (!user.isLoggedIn) {
      return;
    }

    if (user.favorites.length) {
      const listsMap = getCurrentLists().value.reduce(
        (resultMap: { [k: string]: string }, list) => {
          resultMap[list.id] = list.name;
          return resultMap;
        },
        {}
      );

      favorites.value = [];
      user.favorites.forEach((favoriteId) => {
        if (listsMap[favoriteId]) {
          favorites.value.push({ id: favoriteId, name: listsMap[favoriteId] });
        }
      });
    }
  };

  return {
    getFavoritesRef,
    loadFavorites,
  };
}
