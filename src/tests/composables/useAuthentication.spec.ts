import { describe, it, expect, vi, afterEach } from 'vitest';
import { useAuthentication } from '@/composables/useAuthentication';
import { useUser } from '@/composables/useUser';
import flushPromises from 'flush-promises';
import User from '@/models/user';
import constants from '@/util/constants';

import {
  NextFn,
  NextOrObserver,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  getRedirectResult,
  UserCredential,
} from 'firebase/auth';
vi.mock('firebase/auth');

import UserService from '@/services/UserService';
vi.mock('@/services/UserService');

const replace = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => {
    return {
      replace,
    };
  }),
}));

import { firebaseAuth } from '@/boot/firebase';
vi.mock('@/boot/firebase', () => ({
  firebaseAuth: vi.fn(),
}));

const mockUser: Partial<FirebaseUser> = Object.freeze({
  displayName: 'Mocked User',
  uid: '123',
  photoURL: 'http://picture.from.google.com',
  email: 'test@user.com',
  emailVerified: true,
});

describe('Authentication Composable', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('User Authentication', () => {
    it('should start user authentication', () => {
      const { startListeningForFirebaseChanges } = useAuthentication();

      startListeningForFirebaseChanges();

      expect(onAuthStateChanged).toHaveBeenCalled();
    });

    it('should set current user as anonymous when on authentication error', () => {
      const { startListeningForFirebaseChanges } = useAuthentication();
      const { setCurrentUser, getCurrentUserRef } = useUser();

      setCurrentUser(new User({ id: 'TestUserId', name: 'Test User' }));

      vi.mocked(onAuthStateChanged).mockImplementationOnce(() => {
        throw new Error('Something wrong');
      });

      startListeningForFirebaseChanges();

      expect(getCurrentUserRef().value.isAnonymous).toBeTruthy();
    });

    it('should set current user as anonymous when no user is authenticated', () => {
      const { startListeningForFirebaseChanges } = useAuthentication();
      const { getCurrentUserRef } = useUser();

      const mockUndefinedUser: Partial<FirebaseUser | undefined> = undefined;
      const addUserSpy = vi.spyOn(
        UserService,
        'addAuthenticatedUserToListApplication'
      );

      mockAuthenticatedFirebaseUser(mockUndefinedUser);

      startListeningForFirebaseChanges();

      expect(getCurrentUserRef().value.isAnonymous).toBeTruthy();
      expect(addUserSpy).not.toHaveBeenCalled();
    });

    it('should set the current user based on authenticated user', () => {
      const { startListeningForFirebaseChanges } = useAuthentication();
      const { getCurrentUserRef } = useUser();

      mockAuthenticatedFirebaseUser(mockUser);
      startListeningForFirebaseChanges();

      expect(getCurrentUserRef().value.name).toBe(mockUser.displayName);
    });

    it('should retrieve user photo from application storage upon user authentication', async () => {
      const { startListeningForFirebaseChanges } = useAuthentication();
      const { getCurrentUserRef } = useUser();
      const mockPhotoUrl = 'https://my.photo.url';

      vi.mocked(UserService).getUserById.mockResolvedValue(
        new User({
          photoURL: mockPhotoUrl,
        })
      );

      mockAuthenticatedFirebaseUser(mockUser);
      startListeningForFirebaseChanges();

      await flushPromises();

      expect(getCurrentUserRef().value.photoURL).toBe(mockPhotoUrl);
    });

    it('should add authenticated user to application users list if it does not exist yet', () => {
      const { startListeningForFirebaseChanges } = useAuthentication();
      const userServiceSpy = vi.spyOn(
        UserService,
        'addAuthenticatedUserToListApplication'
      );

      vi.mocked(UserService).getUserById.mockImplementationOnce(() => {
        throw new Error('User not found');
      });

      mockAuthenticatedFirebaseUser(mockUser);
      startListeningForFirebaseChanges();

      expect(userServiceSpy).toHaveBeenCalledOnce();
    });

    it('should navigate to login page when user is not authenticated', () => {
      const { startListeningForFirebaseChanges } = useAuthentication();
      const mockUndefinedUser: Partial<FirebaseUser | undefined> = undefined;

      mockAuthenticatedFirebaseUser(mockUndefinedUser);
      startListeningForFirebaseChanges();

      expect(replace).toHaveBeenCalledWith({
        name: constants.routes.login.name,
      });
    });

    it('should navigate to lists after user cached is authenticated', async () => {
      const { startListeningForFirebaseChanges } = useAuthentication();

      mockAuthenticatedFirebaseUser(mockUser);
      startListeningForFirebaseChanges();

      expect(replace).toHaveBeenCalledWith({
        name: constants.routes.lists.name,
      });
    });

    it('should set user as anonymous when user is not authenticated', () => {
      const { startListeningForFirebaseChanges } = useAuthentication();
      const { getCurrentUserId } = useUser();
      const mockUndefinedUser: Partial<FirebaseUser | undefined> = undefined;

      mockAuthenticatedFirebaseUser(mockUndefinedUser);
      startListeningForFirebaseChanges();

      expect(getCurrentUserId()).toBe(constants.user.anonymous);
    });

    function mockAuthenticatedFirebaseUser(
      mockUser: Partial<FirebaseUser | undefined>
    ) {
      vi.mocked(onAuthStateChanged).mockImplementationOnce(
        vi.fn(
          (
            _: Auth,
            onAuthStateChangedCallback: NextOrObserver<FirebaseUser>
          ) => {
            const onAuthStateChangedCallbackFunction =
              onAuthStateChangedCallback as NextFn<
                Partial<FirebaseUser | undefined>
              >;
            onAuthStateChangedCallbackFunction(mockUser);
            return () => [];
          }
        )
      );
    }
  });
  describe('User Login', () => {
    it('should trigger user login', () => {
      const { loginWithEmailAndPassword } = useAuthentication();
      const EMAIL = 'Email';
      const PASSWORD = 'Password';

      loginWithEmailAndPassword(EMAIL, PASSWORD);

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        firebaseAuth,
        EMAIL,
        PASSWORD
      );
    });
    it('should trigger user login with google', () => {
      const { loginWithGooglePopup, setGoogleAuthProvider } =
        useAuthentication();

      const googleAuthProvider = new GoogleAuthProvider();
      setGoogleAuthProvider(googleAuthProvider);
      loginWithGooglePopup();

      expect(signInWithPopup).toHaveBeenLastCalledWith(
        firebaseAuth,
        googleAuthProvider
      );
    });

  });
});
