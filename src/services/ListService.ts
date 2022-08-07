import {
  doc,
  getDoc,
  getDocs,
  query,
  collection,
  where,
  WhereFilterOp,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { firestore } from '@/boot/firebase';
import List from '@/models/list';
import { ListType } from '@/models/models';
import { ListConverter } from './Converters';

export default {
  async getListsByType(
    userId: string,
    type: ListType | undefined
  ): Promise<Array<List>> {
    type firebaseWhereArgs = [string, WhereFilterOp, unknown];

    const ownerArgs: firebaseWhereArgs = ['owner', '==', userId];
    const sharedArgs: firebaseWhereArgs = [
      'sharedWith',
      'array-contains',
      userId,
    ];
    const typeArgs: firebaseWhereArgs = ['type', '==', type];

    const listsCollection = collection(firestore, 'lists').withConverter(
      new ListConverter(userId)
    );
    const ownedListsQuery = query(
      listsCollection,
      where(...ownerArgs),
      where(...typeArgs)
    );
    const sharedListsQuery = query(
      listsCollection,
      where(...sharedArgs),
      where(...typeArgs)
    );

    const ownedListsSnapshots = await getDocs(ownedListsQuery);
    const sharedListsSnapshots = await getDocs(sharedListsQuery);

    return ownedListsSnapshots.docs
      .concat(sharedListsSnapshots.docs)
      .map((snapshot) => snapshot.data());
  },

  async getListById(userId: string, listId: string): Promise<List | null> {
    const listReference = doc(firestore, 'lists', listId).withConverter(
      new ListConverter(userId)
    );
    const listSnapshot = await getDoc(listReference);
    if (listSnapshot.exists()) {
      const list = listSnapshot.data();
      if (list.owner === userId || list.isShared) {
        return list;
      }
    }
    return null;
  },

  async deleteListById(userId: string, listId: string): Promise<void> {
    try {
      const listsCollection = collection(firestore, `lists/${listId}/items`);

      const itemsSnapshots = await getDocs(listsCollection);

      return Promise.all(
        itemsSnapshots.docs.map((itemSnapshot) => {
          return deleteDoc(itemSnapshot.ref);
        })
      ).then(() => {
        return deleteDoc(doc(firestore, 'lists', listId));
      });
    } catch (e: any) {
      throw new Error(e.message);
    }
  },

  async updateListsPriorities(
    userId: string,
    lists: Array<List>
  ): Promise<void[]> {
    return Promise.all(
      lists.map((list) => {
        const listReference = doc(firestore, 'lists', list.id);

        const objectUpdate: { [k: string]: string | number } = {
          changedBy: list.changedBy,
          modifiedAt: list.modifiedAt,
        };
        objectUpdate[`userPriorities.${userId}`] = list.priority;

        return updateDoc(listReference, objectUpdate);
      })
    ).catch((error) => {
      throw new Error(error.message);
    });
  },
};