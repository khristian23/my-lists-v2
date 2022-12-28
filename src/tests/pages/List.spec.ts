import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  waitFor,
  within,
} from '@testing-library/vue';
import MainLayoutTest from './helpers/MainLayoutTest.vue';
import { Quasar } from 'quasar';
import { Router } from 'vue-router';
import constants from '@/util/constants';
import { createRouterForRoutes } from './helpers/router';
import { ListTypeOption } from '@/models/models';
import ListService from '@/services/ListService';
import List from '@/models/list';
import UserService from '@/services/UserService';
import User from '@/models/user';
import { useUser } from '@/composables/useUser';

vi.mock('@/services/ListService');
vi.mock('@/services/UserService');

let router: Router;

const FAKE_USER_ID = 'UserId';
const NEW_LIST_ID = 'new';
const FAKE_LIST_ID = 'ListId';

const currentUser = new User({
  id: FAKE_USER_ID,
  name: 'Fake User',
});

describe('List page', () => {
  beforeEach(async () => {
    router = createRouterForRoutes([
      { name: constants.routes.list.name },
      { name: constants.routes.lists.name },
    ]);

    const { setCurrentUser } = useUser();
    setCurrentUser(currentUser);
  });

  afterEach(() => {
    cleanup();
  });

  function renderList() {
    return render(MainLayoutTest, {
      global: {
        plugins: [Quasar, router],
        stubs: {
          TheFooter: {
            template: '<div><slot></slot></div>',
          },
        },
      },
    });
  }

  function getListType(listTypeId: string): ListTypeOption {
    const listType = constants.lists.types.find(
      ({ value }) => value === listTypeId
    );
    if (!listType) {
      throw new Error('List Type not found');
    }
    return listType;
  }

  function getFirstListSubTypeLabel(listTypeId: string): string {
    const listType = getListType(listTypeId);

    if (listType?.subTypes.length) {
      return listType.subTypes[0].label;
    } else {
      throw new Error('Sub Type not found');
    }
  }

  describe('Basic controls', () => {
    beforeEach(async () => {
      router.push({
        name: constants.routes.list.name,
        params: { id: NEW_LIST_ID },
      });
      await router.isReady();
    });

    it('should render the component', () => {
      const { getByLabelText } = renderList();
      getByLabelText('Name');
    });

    it('should enable the list view for editing', async () => {
      const { getByLabelText } = renderList();

      await waitFor(() =>
        expect((getByLabelText('Name') as HTMLInputElement).disabled).toBe(
          false
        )
      );
    });

    it('should populate list types', async () => {
      const { getByLabelText, getByText } = renderList();

      const shoppingListType = getListType(constants.listType.shoppingCart);

      const groceriesListItem = getFirstListSubTypeLabel(
        constants.listType.shoppingCart
      );

      const typeSelect = getByLabelText('Type');
      await fireEvent.click(typeSelect);

      await waitFor(() => getByText(shoppingListType.label));
      await fireEvent.click(getByText(shoppingListType.label));

      const subTypeSelect = getByLabelText('Sub Type');
      await fireEvent.click(subTypeSelect);

      await waitFor(() => getByText(groceriesListItem));
    });

    it('should default sub type selection', async () => {
      const { getByLabelText, getByText } = renderList();

      const shoppingListType = getListType(constants.listType.shoppingCart);

      const groceriesListItem = getFirstListSubTypeLabel(
        constants.listType.shoppingCart
      );

      const typeSelect = getByLabelText('Type');
      await fireEvent.click(typeSelect);

      await waitFor(() => getByText(shoppingListType.label));
      await fireEvent.click(getByText(shoppingListType.label));

      await waitFor(() => getByText(groceriesListItem));
    });

    it('should update ttile with list name', async () => {
      const { getByLabelText, getByText } = renderList();
      const listName = 'A new list name';

      await fireEvent.update(getByLabelText('Name'), listName);

      getByText('title: ' + listName);
    });
  });

  describe('New list', () => {
    beforeEach(async () => {
      router.push({
        name: constants.routes.list.name,
        params: { id: NEW_LIST_ID },
      });
      await router.isReady();
    });

    it('should set a default list type', async () => {
      const { getByLabelText, getByText } = renderList();

      await waitFor(() => getByLabelText('Type'));
      getByText(getListType(constants.listType.toDoList).label);
      getByLabelText('Sub Type');
      getByText(getFirstListSubTypeLabel(constants.listType.toDoList));
    });
  });

  describe('Existing list', () => {
    beforeEach(async () => {
      router.push({
        name: constants.routes.list.name,
        params: { id: FAKE_LIST_ID },
      });
      await router.isReady();
    });

    it('should load list details', async () => {
      vi.mocked(ListService).getListById.mockResolvedValue(
        new List({
          name: 'List Name',
          description: 'List Description',
          type: constants.listType.shoppingCart,
          subtype: constants.listSubType.house,
        })
      );

      const { getByLabelText, getByText } = renderList();

      await waitFor(() => getByText('title: List name'));

      expect((getByLabelText('Name') as HTMLInputElement).value).toBe(
        'List Name'
      );
      expect((getByLabelText('Description') as HTMLInputElement).value).toBe(
        'List Description'
      );

      getByText(getListType(constants.listType.shoppingCart).label);
      getByText(getListType(constants.listType.shoppingCart).subTypes[1].label);
    });
  });

  describe('Shareable list', () => {
    beforeEach(async () => {
      router.push({
        name: constants.routes.list.name,
        params: { id: FAKE_LIST_ID },
      });
      await router.isReady();

      vi.mocked(ListService).getListById.mockResolvedValue(
        new List({
          id: FAKE_LIST_ID,
          name: 'List Name',
          owner: 'ChristianID',
          type: constants.listType.shoppingCart,
          isShared: true,
        })
      );
    });

    it('should disabled the list view when list is shared', async () => {
      const { getByLabelText } = renderList();

      await waitFor(() =>
        expect((getByLabelText('Name') as HTMLInputElement).disabled).toBe(true)
      );
    });

    it('should show an empty list of users', () => {
      const { getByText, queryAllByTestId } = renderList();

      getByText('Shared With');
      expect(queryAllByTestId('shareableUser').length).toBe(0);
    });

    it('should disable form if user does not own shared list', async () => {
      vi.mocked(UserService).getUsersList.mockResolvedValue([
        new User({
          id: 'ChristianID',
          name: 'Christian Montoya',
          email: 'christian.montoya@test.com',
        }),
      ]);

      const { getAllByTestId, getByTestId } = renderList();

      await waitFor(() =>
        expect(getAllByTestId('shareableUser').length).toBe(1)
      );
      within(getByTestId('shareableUser')).getByText('Owner');
      within(getByTestId('shareableUser')).getByText('Christian Montoya');
      within(getByTestId('shareableUser')).getByText(
        'christian.montoya@test.com'
      );
    });

    it('should list all available users', async () => {
      vi.mocked(UserService).getUsersList.mockResolvedValue([
        new User({
          id: 'TestUser1',
          name: 'Test User 1',
        }),
        new User({
          id: 'TestUser2',
          name: 'Test User 2',
        }),
        new User({
          id: 'TestUser3',
          name: 'Test User 3',
        }),
      ]);

      const { getAllByTestId } = renderList();

      await waitFor(() => {
        expect(getAllByTestId('shareableUser').length).toBe(3);
      });
    });
  });
});
