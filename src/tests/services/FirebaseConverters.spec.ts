import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListConverter } from '@/services/FirebaseConverters';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import List from '@/models/list';
import constants from '@/util/constants';

const CURRENT_USER_ID = 'fake_user_id';
const ANOTHER_USER_ID = 'another_fake_user_id';

describe('Firebase Converters', () => {
  describe('Lists Converters', () => {
    let listConverter: ListConverter;
    let firebaseList: DocumentData;

    beforeEach(() => {
      listConverter = new ListConverter(CURRENT_USER_ID);

      firebaseList = {
        id: 'mmKOVL2r8BPacBl7QENM6uvKoKM2',
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
});
