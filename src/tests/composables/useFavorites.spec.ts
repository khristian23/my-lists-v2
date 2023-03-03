import { describe, expect, it, vi } from 'vitest';
import { useUser } from '@/composables/useUser';
import { useFavorites } from '@/composables/useFavorites';
import { useListables } from '@/composables/useListables';
import ListService from '@/services/ListService';
import User from '@/models/user';
import List from '@/models/list';

vi.mock('@/services/ListService');

const mockUser = new User({
  id: 'UserId',
  name: 'user name',
  favorites: ['FavoriteId1', 'FavoriteId2', 'FavoriteId3'],
});

const mockLists = [
  new List({ id: 'FavoriteId2', name: 'Favorite list 2' }),
  new List({ id: 'FavoriteId3', name: 'Favorite list 3' }),
  new List({ id: 'FavoriteId1', name: 'Favorite list 1' }),
  new List({ id: 'FavoriteId4', name: 'Favorite list 4' }),
];

describe('Favorites Composable', () => {
  it('should get the list of favorite lists', async () => {
    const { setCurrentUser } = useUser();
    const { loadListablesByType } = useListables();
    const { getFavoritesRef, loadFavorites } = useFavorites();

    vi.mocked(ListService).getListablesByType.mockResolvedValue(mockLists);

    setCurrentUser(mockUser);
    await loadListablesByType(undefined);

    loadFavorites();

    expect(getFavoritesRef().value).toStrictEqual([
      { id: 'FavoriteId1', name: 'Favorite list 1' },
      { id: 'FavoriteId2', name: 'Favorite list 2' },
      { id: 'FavoriteId3', name: 'Favorite list 3' },
    ]);
  });
});
