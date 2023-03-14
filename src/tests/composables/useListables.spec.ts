/*
 * Copyright (C) mailto:christian.montoya@gmail.com
 */

import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest';
import { generateLists } from '../helpers/TestHelpers';
import User from '@/models/user';
import Consts from '@/util/constants';
import List from '@/models/list';

const FAKE_USER_ID = 'UserId';

import { useUser } from '@/composables/useUser';
const { setCurrentUser } = useUser();

import ListService from '@/services/ListService';
vi.mock('@/services/ListService');

import { useListables } from '@/composables/useListables';

const MAX_NUMBER_OF_LISTS = 30;
const lists = generateLists(MAX_NUMBER_OF_LISTS);

describe('Lists Composable', () => {
  beforeEach(() => {
    setCurrentUser(new User({ id: FAKE_USER_ID }));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return all lists', async () => {
    vi.mocked(ListService).getListablesByType.mockResolvedValue(lists);

    const { loadListablesByType, getCurrentLists } = useListables();

    await loadListablesByType(undefined);
    const returnedLists = getCurrentLists();

    expect(returnedLists.value.length).toBe(MAX_NUMBER_OF_LISTS);
  });

  it('should return filtered set of lists', async () => {
    const spy = vi
      .spyOn(ListService, 'getListablesByType')
      .mockResolvedValue(lists);

    const type = Consts.listType.note;

    const { loadListablesByType, getCurrentLists } = useListables();

    await loadListablesByType(type);
    const returnedLists = getCurrentLists();

    expect(returnedLists.value.length).toBe(lists.length);
    expect(spy).toHaveBeenCalledWith(FAKE_USER_ID, type);
  });

  it('should flag when lists are being loaded', async () => {
    vi.mocked(ListService).getListablesByType.mockImplementation(() => {
      return new Promise<Array<List>>((resolve) => {
        setTimeout(() => resolve(lists), 200);
      });
    });

    const { isLoadingLists, loadListablesByType } = useListables();

    expect(isLoadingLists.value).toBe(false);

    const loadListPromise = loadListablesByType(Consts.listType.shoppingCart);

    expect(isLoadingLists.value).toBe(true);

    await loadListPromise;

    expect(isLoadingLists.value).toBe(false);
  });

  it('should return one list by its id', async () => {
    vi.mocked(ListService).getListableById.mockResolvedValue(
      new List({
        id: 'ListId',
        type: Consts.listType.note,
        name: 'ListName',
        priority: 0,
      })
    );

    const { getListableById } = useListables();

    const returnedList = await getListableById('ListId');

    expect(returnedList?.name).toBe('ListName');
  });

  it('should cache one list returned', async () => {
    const listId = 'ListIdToBeCached';

    vi.mocked(ListService).getListableById.mockResolvedValue(
      new List({
        id: listId,
      })
    );

    const { getListableById, getCurrentLists } = useListables();

    const returnedListable = await getListableById(listId);

    expect(
      getCurrentLists().value.find(({ id }) => id === returnedListable.id)
    ).toBeTruthy();
  });

  it('should delete a list by Id', async () => {
    const spy = vi.spyOn(ListService, 'deleteListById').mockResolvedValue();

    const { deleteListById } = useListables();

    await deleteListById('ListId');

    expect(spy).toHaveBeenCalledWith('ListId');
  });

  it('should throw an exception in case of error when deleting list', async () => {
    const error = new Error('A whatever kind of error deleting a list');
    vi.mocked(ListService).deleteListById.mockRejectedValue(error);

    const { deleteListById } = useListables();

    await expect(deleteListById('ListId')).rejects.toThrow(
      'Error deleting list by id ListId'
    );
  });

  it('should update the order of the lists', async () => {
    const spy = vi
      .spyOn(ListService, 'updateListsPriorities')
      .mockResolvedValue([]);

    const { updateListsPriorities } = useListables();

    const items = [
      new List({ id: 'ListId', name: 'Name', type: 'note', priority: 0 }),
    ];

    await updateListsPriorities(items);

    expect(spy).toHaveBeenCalledWith(FAKE_USER_ID, items);
  });

  it('should throw an exception in case of error updating lists', async () => {
    const error = new Error('A whatever kind of error updating a list');
    vi.mocked(ListService).updateListsPriorities.mockRejectedValue(error);

    const { updateListsPriorities } = useListables();

    const items = [
      new List({ id: 'ListId', name: 'Name', type: 'note', priority: 0 }),
    ];

    await expect(updateListsPriorities(items)).rejects.toThrow(
      'Error updating lists priorities'
    );
  });

  describe('Favorites', () => {
    const mockDate = new Date();

    beforeEach(() => {
      vi.mocked(ListService).getListablesByType.mockResolvedValue(lists);
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should add list as favorite on existing list', async () => {
      const { getCurrentLists, addListableAsFavorite, loadListablesByType } =
        useListables();

      await loadListablesByType(undefined);

      const list = getCurrentLists().value[0];

      expect(list.isFavorite).toBe(false);

      await addListableAsFavorite(list.id);

      expect(ListService.addToFavorites).toHaveBeenCalled();
      expect(list.isFavorite).toBe(true);
      expect(list.favorites.length).toBe(1);
      expect(list.changedBy).toBe(FAKE_USER_ID);
      expect(list.modifiedAt).toBe(mockDate.getTime());
    });

    it('should add an item to favorite list only once', async () => {
      const { getCurrentLists, addListableAsFavorite, loadListablesByType } =
        useListables();

      await loadListablesByType(undefined);

      const list = getCurrentLists().value[0];
      list.isFavorite = false;
      list.favorites = [];

      await addListableAsFavorite(list.id);
      await addListableAsFavorite(list.id);

      expect(list.favorites.length).toBe(1);
      expect(list.favorites[0]).toBe(FAKE_USER_ID);
      expect(list.isFavorite).toBe(true);
    });

    it('should remove a list as favorite', async () => {
      const { getCurrentLists, removeListableAsFavorite, loadListablesByType } =
        useListables();

      await loadListablesByType(undefined);

      const list = getCurrentLists().value[0];
      list.isFavorite = true;
      list.favorites = [FAKE_USER_ID];

      await removeListableAsFavorite(list.id);

      expect(ListService.removeFromFavorites).toHaveBeenCalled();
      expect(list.isFavorite).toBe(false);
      expect(list.favorites.length).toBe(0);
      expect(list.changedBy).toBe(FAKE_USER_ID);
      expect(list.modifiedAt).toBe(mockDate.getTime());
    });

    it('should remove nothing from empty favorite list', async () => {
      const { getCurrentLists, removeListableAsFavorite } = useListables();

      const list = getCurrentLists().value[0];
      list.isFavorite = false;
      list.favorites = [];

      await removeListableAsFavorite(list.id);

      expect(list.isFavorite).toBe(false);
      expect(list.favorites.length).toBe(0);
    });
  });
});
