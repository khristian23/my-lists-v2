import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest';
import { ref } from 'vue';
import { generateLists } from '../helpers/TestHelpers';
import User from '@/models/user';
import Consts from '@/util/constants';
import List from '@/models/list';

const FAKE_USER_ID = 'UserId';

import { useUser } from '@/composables/useUser';
vi.mock('@/composables/useUser');

import ListService from '@/services/ListService';
vi.mock('@/services/ListService');

import { useLists } from '@/composables/useLists';

const MAX_NUMBER_OF_LISTS = 30;
const lists = generateLists(MAX_NUMBER_OF_LISTS);

describe('Lists Composable', () => {
  beforeEach(() => {
    vi.mocked(useUser).mockImplementation(() => ({
      user: ref<User>(new User({ id: FAKE_USER_ID })),
      getCurrentUserId: () => FAKE_USER_ID,
    }));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return all lists', async () => {
    vi.mocked(ListService).getListsByType.mockResolvedValue(lists);

    const returnedLists = await useLists().getListsByType();

    expect(returnedLists.length).toBe(MAX_NUMBER_OF_LISTS);
  });

  it('should return filtered set of lists', async () => {
    const spy = vi
      .spyOn(ListService, 'getListsByType')
      .mockResolvedValue(lists);

    const type = Consts.listType.note;

    const returnedLists = await useLists().getListsByType(type);

    expect(returnedLists).toBe(lists);
    expect(spy).toHaveBeenCalledWith(FAKE_USER_ID, type);
  });

  it('should flag when lists are being loaded', async () => {
    vi.mocked(ListService).getListsByType.mockImplementation(() => {
      return new Promise<Array<List>>((resolve) => {
        setTimeout(() => resolve(lists), 200);
      });
    });

    const { isLoadingLists, getListsByType } = useLists();

    expect(isLoadingLists.value).toBe(false);

    const getListPromise = getListsByType(Consts.listType.shoppingCart);

    expect(isLoadingLists.value).toBe(true);

    await getListPromise;

    expect(isLoadingLists.value).toBe(false);
  });

  it('should return one list by its id', async () => {
    vi.mocked(ListService).getListById.mockResolvedValue(
      new List({
        id: 'ListId',
        type: Consts.listType.note,
        name: 'ListName',
        priority: 0,
      })
    );

    const { getListById } = useLists();

    const returnedList = await getListById('ListId');

    expect(returnedList?.name).toBe('ListName');
  });

  it('should delete a list by Id', async () => {
    const spy = vi.spyOn(ListService, 'deleteListById').mockResolvedValue();

    const { deleteListById } = useLists();

    await deleteListById('ListId');

    expect(spy).toHaveBeenCalledWith(FAKE_USER_ID, 'ListId');
  });

  it('should throw an exception in case of error when deleting list', async () => {
    const error = new Error('A whatever kind of error deleting a list');
    vi.mocked(ListService).deleteListById.mockRejectedValue(error);

    const { deleteListById } = useLists();

    await expect(deleteListById('ListId')).rejects.toThrow(
      'Error deleting list by id ListId'
    );
  });

  it('should update the order of the lists', async () => {
    const spy = vi
      .spyOn(ListService, 'updateListsPriorities')
      .mockResolvedValue();

    const { updateListsPriorities } = useLists();

    const items = [
      new List({ id: 'ListId', name: 'Name', type: 'note', priority: 0 }),
    ];

    await updateListsPriorities(items);

    expect(spy).toHaveBeenCalledWith(FAKE_USER_ID, items);
  });

  it('should throw an exception in case of error updating lists', async () => {
    const error = new Error('A whatever kind of error updating a list');
    vi.mocked(ListService).updateListsPriorities.mockRejectedValue(error);

    const { updateListsPriorities } = useLists();

    const items = [
      new List({ id: 'ListId', name: 'Name', type: 'note', priority: 0 }),
    ];

    await expect(updateListsPriorities(items)).rejects.toThrow(
      'Error updating lists priorities'
    );
  });
});
