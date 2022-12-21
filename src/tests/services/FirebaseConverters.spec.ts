import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ListConverter,
  ListItemConverter,
} from '@/services/FirebaseConverters';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import List from '@/models/list';
import constants from '@/util/constants';
import ListItem from '@/models/listItem';

const CURRENT_USER_ID = 'fake_user_id';
const ANOTHER_USER_ID = 'another_fake_user_id';
const TEST_LIST_ID = 'fake_list_id';

describe('Firebase Converters', () => {
  describe('Lists Converters', () => {
    let listConverter: ListConverter;
    let firebaseList: DocumentData;

    beforeEach(() => {
      listConverter = new ListConverter(CURRENT_USER_ID);

      firebaseList = {
        description: '',
        modifiedAt: 1665932296442,
        name: 'Compras para la casa',
        owner: 'mmKOVL2r8BPacBl7QENM6uvKoKM2',
        subtype: '',
        type: 'wish',
      };
    });

    function convertFirebaseList(firebaseList: DocumentData): List {
      return listConverter.fromFirestore({
        id: 'mmKOVL2r8BPacBl7QENM6uvKoKM2',
        data: vi.fn().mockReturnValue(firebaseList),
      } as unknown as QueryDocumentSnapshot);
    }

    it('should convert a list from firestore', () => {
      const list = convertFirebaseList(firebaseList);

      expect(list.id).toBe('mmKOVL2r8BPacBl7QENM6uvKoKM2');
      expect(list.description).toBeFalsy();
      expect(list.name).toBe('Compras para la casa');
      expect(list.owner).toBe('mmKOVL2r8BPacBl7QENM6uvKoKM2');
      expect(list.isShared).toBe(false);
      expect(list.priority).toBe(constants.lists.priority.lowest);
    });

    it('should flag list as shared when list owner is not current user', () => {
      firebaseList.sharedWith = [CURRENT_USER_ID];
      firebaseList.owner = ANOTHER_USER_ID;

      const list = convertFirebaseList(firebaseList);

      expect(list.isShared).toBe(true);
    });

    it('should flag list as not shared when list owner is current user', () => {
      firebaseList.sharedWith = [ANOTHER_USER_ID];
      firebaseList.owner = CURRENT_USER_ID;

      const list = convertFirebaseList(firebaseList);

      expect(list.isShared).toBe(false);
    });

    it('should get proper list priority', () => {
      firebaseList.userPriorities = {};
      firebaseList.userPriorities[ANOTHER_USER_ID] = 3;
      firebaseList.userPriorities[CURRENT_USER_ID] = 42;

      const list = convertFirebaseList(firebaseList);

      expect(list.priority).toBe(42);
    });
  });

  describe('List Item Converter', () => {
    let firebaseListItem: DocumentData;
    let listItemConverter: ListItemConverter;

    function convertFirebaseToListItem(
      firebaseListItem: DocumentData
    ): ListItem {
      return listItemConverter.fromFirestore({
        id: '0fVpVusKmZzfTrnbDF5D',
        data: vi.fn().mockReturnValue(firebaseListItem),
      } as unknown as QueryDocumentSnapshot);
    }

    beforeEach(() => {
      listItemConverter = new ListItemConverter(CURRENT_USER_ID, TEST_LIST_ID);

      firebaseListItem = {
        changedBy: 'mmKOVL2r8BPacBl7QENM6uvKoKM2',
        modifiedAt: 1671081121331,
        name: 'Revise documentation for Extensibility',
        notes: '',
        owner: 'mmKOVL2r8BPacBl7QENM6uvKoKM2',
        status: 'Done',
        userPriorities: { fake_user_id: 2 },
      };
    });

    it('should convert a list item from firestore', () => {
      const listItem = convertFirebaseToListItem(firebaseListItem);

      expect(listItem.id).toBe('0fVpVusKmZzfTrnbDF5D');
      expect(listItem.name).toBe('Revise documentation for Extensibility');
      expect(listItem.owner).toBe('mmKOVL2r8BPacBl7QENM6uvKoKM2');
      expect(listItem.status).toBe(constants.itemStatus.done);
      expect(listItem.priority).toBe(2);
      expect(listItem.listId).toBe(TEST_LIST_ID);
    });

    it('should convert a list item to firestore', () => {
      const listItem = new ListItem({
        name: 'Test list item name',
        status: constants.itemStatus.pending,
        priority: 4,
      });

      const firebaseListItem = listItemConverter.toFirestore(listItem);

      expect(firebaseListItem.name).toBe('Test list item name');
      expect(firebaseListItem.status).toBe(constants.itemStatus.pending);
      expect(firebaseListItem.userPriorities[CURRENT_USER_ID]).toBe(4);
    });
  });
});
