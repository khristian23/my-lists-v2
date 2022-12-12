import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/vue';
import MainLayoutTest from './helpers/MainLayoutTest.vue';
import { Quasar } from 'quasar';
import { Router } from 'vue-router';
import { createRouterForRoutes } from './helpers/router';
import constants from '@/util/constants';
import ListService from '@/services/ListService';
import ListItem from '@/models/listItem';
import flushPromises from 'flush-promises';

vi.mock('@/services/ListService');

let router: Router;

const FAKE_LIST_ID = 'ListId';
const FAKE_LIST_ITEM_ID = 'ListItemId';
const FAKE_NEW_ITEM_ID = 'new';
const FAKE_USER_ID = 'UserId';

vi.mock('@/composables/useUser', () => ({
  useUser: () => ({
    getCurrentUserId: () => FAKE_USER_ID,
  }),
}));

describe('List Item page', () => {
  beforeEach(async () => {
    router = createRouterForRoutes([
      { name: constants.routes.listItem.name },
      { name: constants.routes.listItems.name },
    ]);
  });

  afterEach(() => {
    cleanup();
  });

  function renderListItem() {
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

  it('should render the component', async () => {
    router.push({
      name: constants.routes.listItem.name,
      params: { list: FAKE_LIST_ID, id: FAKE_NEW_ITEM_ID },
    });
    await router.isReady();

    const { getByLabelText } = renderListItem();
    getByLabelText('Name');
  });

  describe('New List Item', () => {
    beforeEach(async () => {
      router.push({
        name: constants.routes.listItem.name,
        params: { list: FAKE_LIST_ID, id: FAKE_NEW_ITEM_ID },
      });
      await router.isReady();
    });

    it('should set new list item test', async () => {
      const { getByText } = renderListItem();

      await waitFor(() => getByText('title: New list item'));
    });

    it('should validate missing items', async () => {
      const { getByText } = renderListItem();

      await fireEvent.click(getByText('Save'));

      getByText('Please enter a name');
      expect(ListService.saveListItem).not.toHaveBeenCalled();
    });

    it('should save a new List Item', async () => {
      const { getByLabelText, getByText, emitted } = renderListItem();

      const listItemName = 'Test List Item Name';
      await fireEvent.update(getByLabelText('Name'), listItemName);

      await fireEvent.click(getByText('Save'));

      const [userId, listItem] =
        vi.mocked(ListService).saveListItem.mock.calls[0];
      expect(userId).toBe(FAKE_USER_ID);
      expect(listItem.listId).toBe(FAKE_LIST_ID);
      expect(listItem.name).toBe(listItemName);

      expect(emitted()).toHaveProperty(constants.events.showToast);
    });
  });

  describe('Existent List Item', () => {
    beforeEach(async () => {
      router.push({
        name: constants.routes.listItem.name,
        params: { list: FAKE_LIST_ID, id: FAKE_LIST_ITEM_ID },
      });

      await router.isReady();

      vi.mocked(ListService).getListItemById.mockResolvedValue(
        new ListItem({
          id: FAKE_NEW_ITEM_ID,
          name: 'Existent List Item Name',
        })
      );
    });

    it('should handle not existing list item', async () => {
      const spy = vi.spyOn(router, 'replace');

      vi.mocked(ListService).getListItemById.mockImplementationOnce(() => {
        throw new Error('Not existent item');
      });

      const { emitted } = renderListItem();

      await flushPromises();

      expect(emitted()).toHaveProperty(constants.events.showError);

      expect(spy).toHaveBeenCalledWith({
        name: constants.routes.listItems.name,
        params: { id: FAKE_LIST_ID },
      });
    });

    it('should set edit item title', async () => {
      const { getByText, getByLabelText } = renderListItem();

      await flushPromises();

      getByText('title: Existent list item name');

      const nameField = getByLabelText('Name');

      await fireEvent.update(nameField, 'A new name');

      await flushPromises();

      getByText('title: A new name');
    });
  });
});
