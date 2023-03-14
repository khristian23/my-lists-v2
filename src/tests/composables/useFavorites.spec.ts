import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useUser } from '@/composables/useUser';
import { useFavorites } from '@/composables/useFavorites';
import { useListables } from '@/composables/useListables';
import ListService from '@/services/ListService';
import User from '@/models/user';
import List from '@/models/list';
import { waitFor } from '@testing-library/vue';
import flushPromises from 'flush-promises';
import constants from '@/util/constants';

vi.mock('@/services/ListService');

const mockUser = new User({
  id: 'UserId',
  name: 'user name',
});

const mockLists = [
  new List({
    id: 'listId2',
    name: 'A list 2',
    isFavorite: true,
    type: constants.listType.shoppingCart,
  }),
  new List({
    id: 'listId3',
    name: 'A list 3',
    isFavorite: true,
    type: constants.listType.note,
  }),
  new List({
    id: 'listId1',
    name: 'A list 1',
    isFavorite: true,
    type: constants.listType.toDoList,
  }),
  new List({ id: 'listId4', name: 'A list 4', isFavorite: false }),
];

describe('Favorites Composable', () => {
  describe('Loading time', () => {
    it('should get the list of favorite lists', async () => {
      const { setCurrentUser } = useUser();
      const { loadListablesByType } = useListables();
      const { getFavoritesRef, loadFavorites } = useFavorites();

      vi.mocked(ListService).getListablesByType.mockResolvedValue(mockLists);

      setCurrentUser(mockUser);
      await loadListablesByType(undefined);

      loadFavorites();

      expect(getFavoritesRef().value).toStrictEqual([
        { id: 'listId1', name: 'A list 1', type: constants.listType.toDoList },
        {
          id: 'listId2',
          name: 'A list 2',
          type: constants.listType.shoppingCart,
        },
        { id: 'listId3', name: 'A list 3', type: constants.listType.note },
      ]);
    });

    it('should gte the list of favorites when list loaded late', async () => {
      const { setCurrentUser } = useUser();
      const { loadListablesByType } = useListables();
      const { getFavoritesRef, loadFavorites } = useFavorites();

      vi.mocked(ListService).getListablesByType.mockResolvedValue(mockLists);

      setCurrentUser(mockUser);

      loadFavorites();

      await loadListablesByType(undefined);

      await waitFor(() => {
        expect(getFavoritesRef().value).toStrictEqual([
          {
            id: 'listId1',
            name: 'A list 1',
            type: constants.listType.toDoList,
          },
          {
            id: 'listId2',
            name: 'A list 2',
            type: constants.listType.shoppingCart,
          },
          { id: 'listId3', name: 'A list 3', type: constants.listType.note },
        ]);
      });
    });
  });

  describe('Favorite Management', () => {
    beforeEach(async () => {
      const { setCurrentUser } = useUser();
      const { loadListablesByType } = useListables();
      const { loadFavorites } = useFavorites();

      vi.mocked(ListService).getListablesByType.mockResolvedValue(mockLists);

      setCurrentUser(mockUser);
      await loadListablesByType(undefined);

      loadFavorites();

      flushPromises();
    });

    it('should add an item to favorite list', async () => {
      const listId = 'listId4';

      const { handleFavorite, getFavoritesRef } = useFavorites();

      await handleFavorite(listId);

      expect(
        getFavoritesRef().value.some(
          ({ id, name }) => id === listId && name === 'A list 4'
        )
      ).toBeTruthy();

      expect(ListService.addToFavorites).toHaveBeenCalled();
    });

    it('should remove an item from favorite list', async () => {
      const listId = 'listId1';

      const { handleFavorite, getFavoritesRef } = useFavorites();

      const favorites = getFavoritesRef().value;
      expect(favorites.find(({ id }) => id === listId)).toBeTruthy();

      await handleFavorite(listId);

      expect(favorites.find(({ id }) => id === listId)).toBeFalsy();

      expect(ListService.removeFromFavorites).toHaveBeenCalled();
    });

    it('should produce a link for a list favorite', () => {
      const { getFavoriteLink } = useFavorites();

      const link = getFavoriteLink({
        id: 'favId',
        name: 'fav id',
        type: constants.listType.shoppingCart,
      });

      expect(link).toBe('/list/favId/items');
    });

    it('should produce a link for a note favorite', () => {
      const { getFavoriteLink } = useFavorites();

      const link = getFavoriteLink({
        id: 'favId',
        name: 'fav id',
        type: constants.listType.note,
      });

      expect(link).toBe('/note/favId');
    });
  });

  describe('Favorite loading', () => {
    it('should load favorites when lists are loaded', async () => {
      const { setCurrentUser } = useUser();
      const { loadListablesByType, resetCurrentLists } = useListables();
      const { loadFavorites, getFavoritesRef } = useFavorites();

      resetCurrentLists();

      vi.mocked(ListService).getListablesByType.mockResolvedValue(mockLists);

      loadFavorites();

      setCurrentUser(mockUser);
      await loadListablesByType(undefined);

      expect(getFavoritesRef().value.length).toBe(3);
    });
  });
});
