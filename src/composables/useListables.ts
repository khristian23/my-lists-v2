/*
 * Copyright (C) mailto:christian.montoya@gmail.com
 */

import { useUser } from '@/composables/useUser';
import List from '@/models/list';
import { ListType, Listable, INote, ListableData } from '@/models/models';
import Note from '@/models/note';
import ListService from '@/services/ListService';
import constants from '@/util/constants';
import { Ref, ref } from 'vue';
import {
  setAuditableValues,
  sortByPriorityAndName,
} from '@/composables/useCommons';
import EventManager from '@/services/EventManager';

const isLoadingLists = ref(false);
const currentLists: Ref<Array<Listable>> = ref([]);

export function useListables() {
  const { getCurrentUserId } = useUser();

  const createNewListable = (): Listable =>
    new List({
      type: constants.listType.toDoList,
    });

  const loadListablesByType = async (
    type: ListType | undefined
  ): Promise<void> => {
    isLoadingLists.value = true;

    const userId = getCurrentUserId();
    currentLists.value = await ListService.getListablesByType(userId, type);
    currentLists.value.sort(sortByPriorityAndName);

    EventManager.triggerEvent(constants.events.listables.loaded);
    isLoadingLists.value = false;
  };

  const resetCurrentLists = () => {
    currentLists.value = [];
  };

  const getCurrentLists = (): Ref<Array<Listable>> => {
    return currentLists;
  };

  const getLoadedListableById = (listId: string) => {
    return currentLists.value.find(({ id }) => listId === id);
  };

  const refreshListableById = (listable: Listable) => {
    if (getLoadedListableById(listable.id)) {
      const listableIndex = currentLists.value.findIndex(
        ({ id }) => id === listable.id
      );
      currentLists.value.splice(listableIndex, 1, listable);
    } else {
      currentLists.value.push(listable);
    }
  };

  const getListableById = async (listId: string): Promise<Listable> => {
    const userId = getCurrentUserId();
    const listable = await ListService.getListableById(userId, listId);

    refreshListableById(listable);

    return listable;
  };

  const deleteListById = async (listId: string): Promise<void> => {
    try {
      await ListService.deleteListById(listId);

      const deletedListIndex = currentLists.value.findIndex(
        ({ id }) => id === listId
      );
      currentLists.value.splice(deletedListIndex, 1);
    } catch (e: unknown) {
      if ((e as Error).message === 'Missing or insufficient permissions.') {
        throw new Error('List cannot be deleted as it is a shared list');
      }

      throw new Error('Error deleting list by id ' + listId);
    }
  };

  const updateListsPriorities = (lists: Array<Listable>): Promise<void[]> => {
    const userId = getCurrentUserId();

    lists.forEach((list) => setAuditableValues(list));

    return ListService.updateListsPriorities(userId, lists).catch(() => {
      throw new Error('Error updating lists priorities');
    });
  };

  const saveListable = async (list: Listable): Promise<Listable> => {
    if (!list.id) {
      return saveNewListable(list);
    } else {
      return saveUpdateListable(list);
    }
  };

  const saveNewListable = async (candidate: Listable): Promise<Listable> => {
    let listable: Listable;

    const listableData: ListableData = {
      name: candidate.name,
      description: candidate.description,
      type: candidate.type,
      subtype: candidate.subtype,
      sharedWith: candidate.sharedWith,
      owner: getCurrentUserId(),
    };

    if (candidate.type === constants.listType.note) {
      listable = new Note(listableData);
    } else {
      listable = new List(listableData);
    }

    setAuditableValues(listable);

    const newListId = await ListService.saveListable(
      getCurrentUserId(),
      listable
    );
    listable.id = newListId ?? '';
    return listable;
  };

  const saveUpdateListable = async (listable: Listable): Promise<Listable> => {
    setAuditableValues(listable);

    await ListService.saveListable(getCurrentUserId(), listable);

    return listable;
  };

  const saveNoteContent = async (note: INote) => {
    setAuditableValues(note);

    return ListService.saveNoteContent(note);
  };

  const addListableAsFavorite = async (listableId: string) => {
    const list = getLoadedListableById(listableId);

    if (list) {
      setAuditableValues(list);

      await ListService.addToFavorites(list.id, list);

      list.isFavorite = true;

      if (!list.favorites.includes(getCurrentUserId())) {
        list.favorites.push(getCurrentUserId());
      }
    }
  };

  const removeListableAsFavorite = async (listableId: string) => {
    const list = getLoadedListableById(listableId);

    if (list) {
      setAuditableValues(list);

      await ListService.removeFromFavorites(list.id, list);

      list.isFavorite = false;

      const listIndex = list.favorites.findIndex(
        (userId) => userId === getCurrentUserId()
      );
      if (listIndex >= 0) {
        list.favorites.splice(listIndex, 1);
      }
    }
  };

  return {
    createNewListable,
    isLoadingLists,
    getCurrentLists,
    resetCurrentLists,
    loadListablesByType,
    refreshListableById,
    getListableById,
    deleteListById,
    updateListsPriorities,
    saveListable,
    saveNoteContent,
    addListableAsFavorite,
    removeListableAsFavorite,
  };
}
