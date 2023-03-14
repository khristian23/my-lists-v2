import { ref } from 'vue';
import { useListables } from '@/composables/useListables';
import { FavoriteEntry, Listable } from '@/models/models';
import EventManager from '@/services/EventManager';
import constants from '@/util/constants';

const favorites = ref<Array<FavoriteEntry>>([]);

export function useFavorites() {
  const { getCurrentLists, addListableAsFavorite, removeListableAsFavorite } =
    useListables();

  const createFavoriteEntry = (listable: Listable): FavoriteEntry => {
    return {
      id: listable.id,
      name: listable.name,
      type: listable.type,
    };
  };

  const getFavoritesRef = () => {
    return favorites;
  };

  const loadFavorites = () => {
    getCurrentLists()
      .value.filter((listable) => listable.isFavorite)
      .map(createFavoriteEntry)
      .forEach(refreshFavoriteById);
  };

  const refreshFavoriteById = (favorite: FavoriteEntry) => {
    if (!favorites.value.find(({ id }) => id === favorite.id)) {
      favorites.value.push(favorite);
    }
  };

  EventManager.addListener(constants.events.listables.loaded, loadFavorites);

  const isListableAFavorite = (listableId: string) => {
    return favorites.value.some(({ id }) => id === listableId);
  };

  const handleAddFavorite = async (listable: Listable) => {
    await addListableAsFavorite(listable.id);

    favorites.value.push(createFavoriteEntry(listable));
  };

  const handleRemoveFavorite = async (listable: Listable) => {
    await removeListableAsFavorite(listable.id);

    const favoriteIndex = favorites.value.findIndex(
      ({ id }) => id === listable.id
    );
    if (favoriteIndex >= 0) {
      favorites.value.splice(favoriteIndex, 1);
    }
  };

  const getListableById = (listableId: string) => {
    const listable = getCurrentLists().value.find(
      ({ id }) => id === listableId
    );

    if (!listable) {
      throw new Error('List does not exist');
    }

    return listable;
  };

  const handleFavorite = (listableId: string) => {
    const listableToProcess = getListableById(listableId);

    if (!isListableAFavorite(listableToProcess.id)) {
      return handleAddFavorite(listableToProcess);
    } else {
      return handleRemoveFavorite(listableToProcess);
    }
  };

  const getFavoriteLink = (favorite: FavoriteEntry) => {
    let favoriteLink = '';

    if (favorite.type === constants.listType.note) {
      favoriteLink = constants.routes.note.path;
    } else {
      favoriteLink = constants.routes.listItems.path;
    }

    return favoriteLink.replace(':id', favorite.id);
  };

  return {
    getFavoritesRef,
    loadFavorites,
    handleFavorite,
    getFavoriteLink,
  };
}
