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
import { Auditable, Listable, ListTypeOption } from '@/models/models';
import ListService from '@/services/ListService';
import List from '@/models/list';
import UserService from '@/services/UserService';
import User from '@/models/user';
import { useUser } from '@/composables/useUser';
import flushPromises from 'flush-promises';
import Note from '@/models/note';

vi.mock('@/services/ListService');
vi.mock('@/services/UserService');

let router: Router;

const FAKE_USER_ID = 'UserId';
const FAKE_USER_ID_2 = 'UserId2';
const FAKE_USER_ID_3 = 'UserId3';
const NEW_LIST_ID = 'new';
const FAKE_LIST_ID = 'ListId';

const currentUser = new User({
  id: FAKE_USER_ID,
  name: 'Fake User',
});

const mockDate = new Date(2000, 12, 1, 16);

vi.mock('@/composables/useCommons', () => ({
  setAuditableValues: (auditable: Auditable) => {
    auditable.changedBy = FAKE_USER_ID;
    auditable.modifiedAt = mockDate.getTime();
  },
}));

describe('List page', () => {
  beforeEach(async () => {
    router = createRouterForRoutes([
      { name: constants.routes.list.name },
      { name: constants.routes.lists.name },
      { name: constants.routes.listItems.name },
      { name: constants.routes.note.name },
    ]);

    const { setCurrentUser } = useUser();
    setCurrentUser(currentUser);
  });

  afterEach(() => {
    vi.resetAllMocks();

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

  function getListTypeOption(listTypeId: string): ListTypeOption {
    const listType = constants.lists.types.find(
      ({ value }) => value === listTypeId
    );
    if (!listType) {
      throw new Error('List Type not found');
    }
    return listType;
  }

  function getFirstListSubTypeLabel(listTypeId: string): string {
    const listType = getListTypeOption(listTypeId);

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

      const shoppingListType = getListTypeOption(
        constants.listType.shoppingCart
      );

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

      const shoppingListType = getListTypeOption(
        constants.listType.shoppingCart
      );

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
      getByText(getListTypeOption(constants.listType.toDoList).label);
      getByLabelText('Sub Type');
      getByText(getFirstListSubTypeLabel(constants.listType.toDoList));
    });

    it('should save a new list', async () => {
      const routerSpy = vi
        .spyOn(router, 'replace')
        .mockImplementationOnce(() => {
          return Promise.resolve();
        });

      const expectedList = new List({
        id: undefined,
        name: 'Test List Name',
        type: constants.listType.shoppingCart,
        subtype: constants.listSubType.groceries,
        sharedWith: [FAKE_USER_ID_2],
        owner: FAKE_USER_ID,
        changedBy: FAKE_USER_ID,
        modifiedAt: mockDate.getTime(),
      });

      const newListId = 'NewListId';

      vi.mocked(ListService).saveListable.mockResolvedValueOnce(newListId);

      vi.mocked(UserService).getUsersList.mockResolvedValue([
        new User({
          id: FAKE_USER_ID_2,
          name: 'Test User 2',
        }),
      ]);

      const { getByLabelText, getByText, emitted, getByRole, getByTestId } =
        renderList();

      await fireEvent.update(getByLabelText('Name'), 'Test List Name');

      const shoppingListType = getListTypeOption(
        constants.listType.shoppingCart
      );

      const typeSelect = getByLabelText('Type');
      await fireEvent.click(typeSelect);

      await waitFor(() => getByText(shoppingListType.label));
      await fireEvent.click(getByText(shoppingListType.label));

      const shareUserButton = within(getByTestId('shareableUser')).getAllByRole(
        'checkbox'
      );
      await fireEvent.click(shareUserButton[0]);

      const saveButton = getByRole('button', { name: 'Save' });
      await fireEvent.click(saveButton);

      await waitFor(() => {
        expect(ListService.saveListable).toHaveBeenCalledWith(
          FAKE_USER_ID,
          expectedList
        );
      });

      await waitFor(() => {
        expect(emitted()).toHaveProperty(constants.events.showToast);
      });

      await waitFor(() => {
        expect(routerSpy).toHaveBeenCalledWith({
          name: constants.routes.listItems.name,
          params: {
            id: newListId,
          },
        });
      });
    });

    it('should navigate to note details when saving a new note', async () => {
      const routerSpy = vi
        .spyOn(router, 'replace')
        .mockImplementationOnce(() => {
          return Promise.resolve();
        });

      const expectedNote = new Note({
        id: undefined,
        name: 'Test Note Name',
        type: constants.listType.note,
        subtype: '',
        noteContent: '',
        owner: FAKE_USER_ID,
        changedBy: FAKE_USER_ID,
        modifiedAt: mockDate.getTime(),
      });

      const newNoteId = 'NewNoteId';

      vi.mocked(ListService).saveListable.mockResolvedValueOnce(newNoteId);

      vi.mocked(UserService).getUsersList.mockResolvedValue([
        new User({
          id: FAKE_USER_ID_2,
          name: 'Test User 2',
        }),
      ]);

      const { getByLabelText, getByText, emitted, getByRole } = renderList();

      await fireEvent.update(getByLabelText('Name'), 'Test Note Name');

      const noteType = getListTypeOption(constants.listType.note);

      const typeSelect = getByLabelText('Type');
      await fireEvent.click(typeSelect);

      await waitFor(() => getByText(noteType.label));
      await fireEvent.click(getByText(noteType.label));

      const saveButton = getByRole('button', { name: 'Save' });
      await fireEvent.click(saveButton);

      await waitFor(() => {
        expect(ListService.saveListable).toHaveBeenCalledWith(
          FAKE_USER_ID,
          expectedNote
        );
      });

      await waitFor(() => {
        expect(emitted()).toHaveProperty(constants.events.showToast);
      });

      await waitFor(() => {
        expect(routerSpy).toHaveBeenCalledWith({
          name: constants.routes.note.name,
          params: {
            id: newNoteId,
          },
        });
      });
    });
  });

  describe('New List with query', () => {
    it('should default passed list type on list creation', async () => {
      router.push({
        path: `/list/${NEW_LIST_ID}`,
        query: { type: constants.listType.whishlist },
      });
      await router.isReady();

      const { getByText } = renderList();

      await waitFor(() =>
        getByText(getListTypeOption(constants.listType.whishlist).label)
      );
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
      vi.mocked(ListService).getListableById.mockResolvedValue(
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

      getByText(getListTypeOption(constants.listType.shoppingCart).label);
      getByText(
        getListTypeOption(constants.listType.shoppingCart).subTypes[1].label
      );
    });

    it('should save an existing list', async () => {
      const routerSpy = vi
        .spyOn(router, 'replace')
        .mockImplementationOnce(() => {
          return Promise.resolve();
        });

      vi.mocked(UserService).getUsersList.mockResolvedValue([
        new User({
          id: FAKE_USER_ID_2,
          name: 'Test User 2',
        }),
        new User({
          id: FAKE_USER_ID_3,
          name: 'Test User 3',
        }),
      ]);

      vi.mocked(ListService).getListableById.mockResolvedValue(
        new List({
          id: FAKE_LIST_ID,
          name: 'Old Name',
          description: 'Old Description',
          type: constants.listType.shoppingCart,
          subtype: constants.listSubType.house,
          sharedWith: [FAKE_USER_ID_2],
          isShared: false,
          owner: FAKE_USER_ID,
        })
      );

      const { getByLabelText, getByText, emitted, getByRole, getAllByTestId } =
        renderList();

      await flushPromises();

      await fireEvent.update(getByLabelText('Name'), 'Changed Name');
      await fireEvent.update(
        getByLabelText('Description'),
        'Changed Description'
      );

      const wishlistType = getListTypeOption(constants.listType.whishlist);

      const typeSelect = getByLabelText('Type');
      await fireEvent.click(typeSelect);

      await waitFor(() => getByText(wishlistType.label));
      await fireEvent.click(getByText(wishlistType.label));

      const fakeUser2SharedButton = within(
        getAllByTestId('shareableUser')[0]
      ).getAllByRole('checkbox')[0];
      await fireEvent.click(fakeUser2SharedButton);

      const fakeUser3SharedButton = within(
        getAllByTestId('shareableUser')[1]
      ).getAllByRole('checkbox')[0];
      await fireEvent.click(fakeUser3SharedButton);

      const saveButton = getByRole('button', { name: 'Save' });
      await fireEvent.click(saveButton);

      expect(ListService.saveListable).toHaveBeenCalledWith(
        FAKE_USER_ID,
        new List({
          id: FAKE_LIST_ID,
          name: 'Changed Name',
          description: 'Changed Description',
          type: constants.listType.whishlist,
          subtype: '',
          sharedWith: [FAKE_USER_ID_3],
          owner: FAKE_USER_ID,
          changedBy: FAKE_USER_ID,
          modifiedAt: mockDate.getTime(),
        })
      );

      await waitFor(() => {
        expect(emitted()).toHaveProperty(constants.events.showToast);
      });

      expect(routerSpy).toHaveBeenCalledWith({
        name: constants.routes.listItems.name,
        params: { id: FAKE_LIST_ID },
      });
    });
  });

  describe('Shareable list', () => {
    beforeEach(async () => {
      router.push({
        name: constants.routes.list.name,
        params: { id: FAKE_LIST_ID },
      });
      await router.isReady();

      vi.mocked(ListService).getListableById.mockResolvedValue(
        new List({
          id: FAKE_LIST_ID,
          name: 'List Name',
          owner: 'ChristianID',
          type: constants.listType.shoppingCart,
          isShared: true,
          sharedWith: [FAKE_USER_ID_2],
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
          id: FAKE_USER_ID_2,
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

      expect(
        within(getAllByTestId('shareableUser')[1])
          .getByRole('checkbox')
          .getAttribute('aria-checked')
      ).toBe('true');
    });
  });
});
