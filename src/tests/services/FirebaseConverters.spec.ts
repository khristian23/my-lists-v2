import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListConverter } from '@/services/FirebaseConverters';
import { QueryDocumentSnapshot } from 'firebase/firestore';

const FAKE_USER_ID = 'fake_user_id';

describe('Firebase Converters', () => {
  describe('Lists Converters', () => {
    let listConverter: ListConverter;

    beforeEach(() => {
      listConverter = new ListConverter(FAKE_USER_ID);
    });

    it('should convert a list from firestore', () => {
      const firebaseUser = {
        changedBy: 'mmKOVL2r8BPacBl7QENM6uvKoKM2',
        description: '',
        modifiedAt: 1665932296442,
        name: 'Compras para la casa',
        owner: 'mmKOVL2r8BPacBl7QENM6uvKoKM2',
        sharedWith: [],
        subtype: '',
        type: 'wish',
        userPriorities: { mmKOVL2r8BPacBl7QENM6uvKoKM2: 0 },
      };

      const list = listConverter.fromFirestore({
        data: vi.fn().mockReturnValue(firebaseUser),
      } as unknown as QueryDocumentSnapshot);

      expect(list.isShared).toBeFalsy();
    });
  });
});
