/*
 * Copyright (C) mailto:christian.montoya@gmail.com
 */

import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  collection,
  where,
  WhereFilterOp,
  updateDoc,
  deleteDoc,
  arrayUnion,
  FieldValue,
  arrayRemove,
  QueryConstraint,
} from 'firebase/firestore';
import { firestore } from '@/boot/firebase';
import {
  Auditable,
  BaseItem,
  ListType,
  Sortable,
  IListItem,
  Listable,
  INote,
} from '@/models/models';
import { ListableConverter, ListItemConverter } from './FirebaseConverters';
import constants from '@/util/constants';

type Prioritizable = BaseItem & Sortable & Auditable;
type ObjectUpdate = { [k: string]: string | number | FieldValue };

const getListItemsByListId = async (
  userId: string,
  listId: string,
  constraint?: QueryConstraint
): Promise<Array<IListItem>> => {
  const constraints = [];
  if (constraint) {
    constraints.push(constraint);
  }

  const listItemsCollection = collection(
    firestore,
    `lists/${listId}/items`
  ).withConverter(new ListItemConverter(userId, listId));

  const listItemsQuery = query(listItemsCollection, ...constraints);

  const listItemsSnapshots = await getDocs(listItemsQuery);

  return listItemsSnapshots.docs.map((snapshot) => snapshot.data());
};

export default {
  async getListablesByType(
    userId: string,
    type: ListType | undefined
  ): Promise<Array<Listable>> {
    type firebaseWhereArgs = [string, WhereFilterOp, unknown];

    const ownerArgs: firebaseWhereArgs = ['owner', '==', userId];
    const sharedArgs: firebaseWhereArgs = [
      'sharedWith',
      'array-contains',
      userId,
    ];
    const typeArgs: firebaseWhereArgs = ['type', '==', type];

    const listsCollection = collection(firestore, 'lists').withConverter(
      new ListableConverter(userId)
    );

    const ownedListWhere = [where(...ownerArgs)];
    const sharedListWhere = [where(...sharedArgs)];

    if (type) {
      ownedListWhere.push(where(...typeArgs));
      sharedListWhere.push(where(...typeArgs));
    }

    const ownedListsQuery = query(listsCollection, ...ownedListWhere);
    const sharedListsQuery = query(listsCollection, ...sharedListWhere);

    const ownedListsSnapshots = await getDocs(ownedListsQuery);
    const sharedListsSnapshots = await getDocs(sharedListsQuery);

    return ownedListsSnapshots.docs
      .concat(sharedListsSnapshots.docs)
      .map((snapshot) => snapshot.data());
  },

  async getListableById(userId: string, listId: string): Promise<Listable> {
    const listReference = doc(firestore, 'lists', listId).withConverter(
      new ListableConverter(userId)
    );
    const listSnapshot = await getDoc(listReference);
    if (listSnapshot.exists()) {
      const list = listSnapshot.data();
      if (list.owner === userId || list.isShared) {
        return list;
      } else {
        throw new Error('No permissions to read list');
      }
    } else {
      throw new Error('List not found');
    }
  },

  async getListItemById(
    userId: string,
    listId: string,
    listItemId: string
  ): Promise<IListItem> {
    const listItemReference = doc(
      firestore,
      `lists/${listId}/items/${listItemId}`
    ).withConverter(new ListItemConverter(userId, listId));

    const listItemSnapshot = await getDoc(listItemReference);
    if (listItemSnapshot.exists()) {
      return listItemSnapshot.data();
    }
    throw new Error('List Item not found');
  },

  async getAllListItemsByListId(
    userId: string,
    listId: string
  ): Promise<Array<IListItem>> {
    return getListItemsByListId(userId, listId);
  },

  async getPendingListItemsByListId(
    userId: string,
    listId: string
  ): Promise<Array<IListItem>> {
    const withOnlyPendingListItems = where(
      'status',
      '==',
      constants.itemStatus.pending
    );

    return getListItemsByListId(userId, listId, withOnlyPendingListItems);
  },

  async deleteListById(listId: string): Promise<void> {
    const listsCollection = collection(firestore, `lists/${listId}/items`);

    const itemsSnapshots = await getDocs(listsCollection);

    if (!itemsSnapshots.empty) {
      await Promise.all(
        itemsSnapshots.docs.map((itemSnapshot) => {
          return deleteDoc(itemSnapshot.ref);
        })
      );
    }
    return deleteDoc(doc(firestore, `lists/${listId}`));
  },

  async updateListObjectPriorities(
    userId: string,
    listObjects: Array<Prioritizable>,
    referenceBuilder: (object: Prioritizable) => string
  ) {
    return Promise.all(
      listObjects.map((object) => {
        const listReference = doc(firestore, referenceBuilder(object));

        const objectUpdate: ObjectUpdate = {
          changedBy: object.changedBy,
          modifiedAt: object.modifiedAt,
        };
        objectUpdate[`userPriorities.${userId}`] =
          object.priority ?? constants.lists.priority.lowest;

        return updateDoc(listReference, objectUpdate);
      })
    ).catch((error) => {
      throw new Error(error.message);
    });
  },

  async updateListsPriorities(
    userId: string,
    lists: Array<Listable>
  ): Promise<void[]> {
    return this.updateListObjectPriorities(
      userId,
      lists,
      ({ id }) => `lists/${id}`
    );
  },

  async updateListItemsPriorities(
    userId: string,
    listId: string,
    listItems: Array<IListItem>
  ): Promise<void[]> {
    return this.updateListObjectPriorities(
      userId,
      listItems,
      ({ id }) => `lists/${listId}/items/${id}`
    );
  },

  async setListItemStatus(listItem: IListItem, status: string): Promise<void> {
    const objectUpdate: ObjectUpdate = {
      changedBy: listItem.changedBy,
      modifiedAt: listItem.modifiedAt,
      status: status,
    };

    const listItemReference = doc(
      firestore,
      `lists/${listItem.listId}/items/${listItem.id}`
    );

    return updateDoc(listItemReference, objectUpdate);
  },

  async deleteListItem(listId: string, listItemId: string): Promise<void> {
    return deleteDoc(doc(firestore, `lists/${listId}/items/${listItemId}`));
  },

  async saveListable(
    userId: string,
    listable: Listable
  ): Promise<void | string> {
    const listConverter = new ListableConverter(userId);

    if (listable.id) {
      const listReference = doc(firestore, `lists/${listable.id}`);

      return updateDoc(
        listReference,
        listConverter.toFirestoreUpdate(listable)
      );
    } else {
      const createdListReference = doc(
        collection(firestore, 'lists')
      ).withConverter(listConverter);

      await setDoc(createdListReference, listable);

      return createdListReference.id;
    }
  },

  async saveListItem(userId: string, listItem: IListItem): Promise<void> {
    if (!listItem.listId) {
      throw new Error('List item must have be part of a list');
    }

    const listItemConverter = new ListItemConverter(userId, listItem.listId);

    if (listItem.id) {
      const itemReference = doc(
        firestore,
        `lists/${listItem.listId}/items/${listItem.id}`
      );

      return updateDoc(
        itemReference,
        listItemConverter.toFirestoreUpdate(listItem)
      );
    } else {
      const createdItemRef = doc(
        collection(firestore, `lists/${listItem.listId}/items`)
      ).withConverter(listItemConverter);

      await setDoc(createdItemRef, listItem);

      listItem.id = createdItemRef.id;
    }
  },

  async saveNoteContent(note: INote): Promise<void> {
    const objectUpdate: ObjectUpdate = {
      changedBy: note.changedBy,
      modifiedAt: note.modifiedAt,
      noteContent: note.noteContent,
    };

    const listItemReference = doc(firestore, `lists/${note.id}`);

    return updateDoc(listItemReference, objectUpdate);
  },

  async updateFavorites(listId: string, objectUpdate: ObjectUpdate) {
    const listReference = doc(firestore, `lists/${listId}`);

    return updateDoc(listReference, objectUpdate);
  },

  async addToFavorites(listId: string, auditable: Auditable): Promise<void> {
    return this.updateFavorites(listId, {
      changedBy: auditable.changedBy,
      modifiedAt: auditable.modifiedAt,
      favorites: arrayUnion(auditable.changedBy),
    });
  },

  async removeFromFavorites(
    listId: string,
    auditable: Auditable
  ): Promise<void> {
    return this.updateFavorites(listId, {
      changedBy: auditable.changedBy,
      modifiedAt: auditable.modifiedAt,
      favorites: arrayRemove(auditable.changedBy),
    });
  },
};
