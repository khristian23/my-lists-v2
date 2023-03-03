import { describe, it, beforeEach, afterEach, vi } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/vue';
import { Quasar } from 'quasar';
import TheFavorites from '@/components/TheFavorites.vue';
import User from '@/models/user';
import ListService from '@/services/ListService';
import { Listable } from '@/models/models';
import List from '@/models/list';
import { useUser } from '@/composables/useUser';
import { useListables } from '@/composables/useListables';

// vi.mock('@/composables/useFavorites');
vi.mock('@/services/UserService');
vi.mock('@/services/ListService');

describe('the Favorites', () => {
  let mockedUser: User;
  let mockedLists: Array<Listable>;

  function renderFavorites() {
    return render(TheFavorites, {
      global: {
        plugins: [Quasar],
      },
    });
  }

  beforeEach(() => {
    mockedUser = new User({
      id: 'TestUserId',
      name: 'test user',
      favorites: ['testListId', 'testListId2'],
    });

    mockedLists = [
      new List({ id: 'testListId', name: 'Test List Name 1' }),
      new List({ id: 'testListId2', name: 'Test List Name 2' }),
    ];
  });

  afterEach(() => {
    cleanup();
  });

  it('should render the component', () => {
    const { getByText } = renderFavorites();

    getByText('Favorites');
  });

  it('should render a list of favorites', async () => {
    vi.mocked(ListService).getListablesByType.mockResolvedValue(mockedLists);

    const { setCurrentUser } = useUser();
    setCurrentUser(mockedUser);

    const { loadListablesByType } = useListables();
    await loadListablesByType(undefined);

    const { getByText } = renderFavorites();

    await waitFor(() => getByText('Test List Name 1'));
    getByText('Test List Name 2');
  });

  it('should navigate to the selected list', () => {});

  it('should add a new list to favorites', () => {});

  it('should sync a favorite list renamed', () => {});

  it('should remove a favorite list', () => {});
});
