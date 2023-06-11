import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ListItemConverter,
  UserConverter,
  ListableConverter,
} from '@/services/FirebaseConverters';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import constants from '@/util/constants';
import ListItem from '@/models/listItem';
import Note from '@/models/note';
import User from '@/models/user';
import { IList, IListItem, INote, Listable } from '@/models/models';
import List from '@/models/list';

const CURRENT_USER_ID = 'fake_user_id';
const ANOTHER_USER_ID = 'another_fake_user_id';
const TEST_LIST_ID = 'fake_list_id';

describe('Firebase Converters', () => {
  describe('User Converter', () => {
    let userConverter: UserConverter;
    let firebaseUser: DocumentData;

    beforeEach(() => {
      userConverter = new UserConverter();

      firebaseUser = {
        name: 'User Name',
        email: 'user.name@email.com',
        photoURL: 'https://domain.and.port.of/user/photo-url',
      };
    });

    function convertFirebaseUser(firebaseUser: DocumentData): User {
      return userConverter.fromFirestore({
        id: 'mmKOVL2rAAPacBl7QENM6uvKoKM2',
        data: vi.fn().mockReturnValue(firebaseUser),
      } as unknown as QueryDocumentSnapshot);
    }

    it('should convert a user from firestore', () => {
      const user = convertFirebaseUser(firebaseUser);

      expect(user.id).toBe('mmKOVL2rAAPacBl7QENM6uvKoKM2');
      expect(user.name).toBe('User Name');
      expect(user.email).toBe('user.name@email.com');
      expect(user.photoURL).toBe('https://domain.and.port.of/user/photo-url');
    });
  });

  describe('List Converters', () => {
    let listableConverter: ListableConverter;
    let firebaseList: DocumentData;

    beforeEach(() => {
      listableConverter = new ListableConverter(CURRENT_USER_ID);

      firebaseList = {
        description: 'list description',
        modifiedAt: 1665932296442,
        name: 'Compras para la casa',
        owner: 'mmKOVL2r8BPacBl7QENM6uvKoKM2',
        type: constants.listType.shoppingCart,
        subtype: constants.listSubType.house,
        keepDoneItems: false,
      };
    });

    describe('Firebase to List', () => {
      function convertFirebaseList(firebaseList: DocumentData): Listable {
        return listableConverter.fromFirestore({
          id: 'mmKOVL2r8BPacBl7QENM6uvKoKM2',
          data: vi.fn().mockReturnValue(firebaseList),
        } as unknown as QueryDocumentSnapshot);
      }

      it('should convert a list from firestore', () => {
        const list = convertFirebaseList(firebaseList);

        expect(list.id).toBe('mmKOVL2r8BPacBl7QENM6uvKoKM2');
        expect(list.description).toBe('list description');
        expect(list.name).toBe('Compras para la casa');
        expect(list.owner).toBe('mmKOVL2r8BPacBl7QENM6uvKoKM2');
        expect(list.isShared).toBe(false);
        expect(list.priority).toBe(constants.lists.priority.lowest);
        expect(list.type).toBe(constants.listType.shoppingCart);
        expect(list.subtype).toBe(constants.listSubType.house);
        expect((list as IList).keepDoneItems).toBe(false);
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

      it('should flag list as favorite', () => {
        firebaseList.favorites = [ANOTHER_USER_ID, CURRENT_USER_ID];

        const list = convertFirebaseList(firebaseList);
        expect(list.isFavorite).toBe(true);
      });
    });

    describe('List to Firebase', () => {
      it('should create a list that does not store done items', () => {
        const list = new List({ keepDoneItems: false });

        const firebaseList = listableConverter.toFirestore(list);

        expect(firebaseList.keepDoneItems).toBeFalsy();
      });

      it('should create list with favorite', () => {
        const list = new List({ isFavorite: true });

        const firebaseList = listableConverter.toFirestore(list);

        expect(firebaseList.favorites).includes(CURRENT_USER_ID);
      });
    });
  });

  describe('Note converter', () => {
    let listableConverter: ListableConverter;
    let firebaseNote: DocumentData;
    let note: INote;

    beforeEach(() => {
      listableConverter = new ListableConverter(CURRENT_USER_ID);

      firebaseNote = {
        modifiedAt: 1665932296442,
        name: 'Notes muy importantes',
        description: 'Note description',
        owner: 'mmKOVL2r8BPacBl7QENM6uvKoKM2',
        type: constants.listType.note,
        noteContent: 'Este es el contenido de la nota',
      };

      note = new Note({
        modifiedAt: 1665932296442,
        name: 'Notes muy importantes',
        description: '',
        owner: 'mmKOVL2r8BPacBl7QENM6uvKoKM2',
        priority: 12,
        type: constants.listType.note,
        noteContent: 'Este es el contenido de la nota',
      });
    });

    function convertFirebaseNote(firebaseNote: DocumentData): Listable {
      return listableConverter.fromFirestore({
        id: 'mmKOVL2r8BPacBl7QENM6uvKoKM2',
        data: vi.fn().mockReturnValue(firebaseNote),
      } as unknown as QueryDocumentSnapshot);
    }

    it('should convert a note from firestore', () => {
      const note = convertFirebaseNote(firebaseNote) as INote;

      expect(note.id).toBe('mmKOVL2r8BPacBl7QENM6uvKoKM2');
      expect(note.name).toBe('Notes muy importantes');
      expect(note.description).toBe('Note description');
      expect(note.owner).toBe('mmKOVL2r8BPacBl7QENM6uvKoKM2');
      expect(note.isShared).toBe(false);
      expect(note.priority).toBe(constants.lists.priority.lowest);
      expect(note.type).toBe(constants.listType.note);
      expect(note.noteContent).toBe('Este es el contenido de la nota');
    });

    it('should convert a note from app to firestore', () => {
      const convertedFirebaseNote = listableConverter.toFirestore(note);

      expect(convertedFirebaseNote.id).toBe(note.id);
      expect(convertedFirebaseNote.name).toBe(note.name);
      expect(convertedFirebaseNote.description).toBe(note.description);
      expect(convertedFirebaseNote.owner).toBe(CURRENT_USER_ID);
      expect(convertedFirebaseNote.type).toBe(note.type);
      expect(convertedFirebaseNote.noteContent).toBe(note.noteContent);
    });
  });

  describe('List Item Converter', () => {
    let firebaseListItem: DocumentData;
    let listItemConverter: ListItemConverter;

    function convertFirebaseToListItem(
      firebaseListItem: DocumentData
    ): IListItem {
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
        notes: 'Here you find some notes',
        owner: 'mmKOVL2r8BPacBl7QENM6uvKoKM2',
        status: 'Done',
        userPriorities: { fake_user_id: 2 },
      };
    });

    it('should convert a list item from firestore', () => {
      const listItem = convertFirebaseToListItem(firebaseListItem);

      expect(listItem.id).toBe('0fVpVusKmZzfTrnbDF5D');
      expect(listItem.name).toBe('Revise documentation for Extensibility');
      expect(listItem.notes).toBe('Here you find some notes');
      expect(listItem.owner).toBe('mmKOVL2r8BPacBl7QENM6uvKoKM2');
      expect(listItem.status).toBe(constants.itemStatus.done);
      expect(listItem.priority).toBe(2);
      expect(listItem.listId).toBe(TEST_LIST_ID);
    });

    it('should convert a list item to firestore', () => {
      const listItem = new ListItem({
        name: 'Test list item name',
        notes: 'More notes added',
        status: constants.itemStatus.pending,
        priority: 4,
      });

      const firebaseListItem = listItemConverter.toFirestore(listItem);

      expect(firebaseListItem.name).toBe('Test list item name');
      expect(firebaseListItem.notes).toBe('More notes added');
      expect(firebaseListItem.status).toBe(constants.itemStatus.pending);
      expect(firebaseListItem.userPriorities[CURRENT_USER_ID]).toBe(4);
    });
  });
});
