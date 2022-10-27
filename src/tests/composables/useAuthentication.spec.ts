import { describe, it, expect, vi } from 'vitest';
import { useAuthentication } from '@/composables/useAuthentication';
import { useUser } from '@/composables/useUser';
import { NextFn } from 'firebase/auth';
import flushPromises from 'flush-promises';
import {
  NextOrObserver,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth,
} from 'firebase/auth';
import User from '@/models/user';

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

import UserService from '@/services/UserService';
vi.mock('@/services/UserService');

import { useRouter } from 'vue-router';
import constants from '@/util/constants';
const replace = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => {
    return {
      replace,
    };
  }),
}));

describe('Authentication Composable', () => {
  const mockUser: Partial<FirebaseUser> = Object.freeze({
    displayName: 'Mocked User',
    uid: '123',
    photoUrl: '',
    email: 'test@user.com',
    emailVerified: true,
  });

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

  it('should add authenticated user to application users list upon user authentication', () => {
    const { startListeningForFirebaseChanges } = useAuthentication();

    const userServiceSpy = vi.spyOn(
      UserService,
      'addAuthenticatedUserToListApplication'
    );

    mockAuthenticatedFirebaseUser(mockUser);

    startListeningForFirebaseChanges();

    expect(userServiceSpy).toHaveBeenCalledOnce();
  });

  it('should retrieve user photo from application storage upon user authentication', async () => {
    const { startListeningForFirebaseChanges } = useAuthentication();
    const { getCurrentUserRef } = useUser();

    const mockPhotoUrl = 'https://my.photo.url';
    vi.mocked(UserService).getUserPhotoURLFromStorage.mockResolvedValue(
      mockPhotoUrl
    );

    mockAuthenticatedFirebaseUser(mockUser);

    await startListeningForFirebaseChanges();

    await flushPromises();

    expect(getCurrentUserRef().value.photoURL).toBe(mockPhotoUrl);
  });

  it('should set the current user based on authenticated user', () => {
    const { startListeningForFirebaseChanges } = useAuthentication();
    const { getCurrentUserRef } = useUser();

    mockAuthenticatedFirebaseUser(mockUser);

    startListeningForFirebaseChanges();

    expect(getCurrentUserRef().value.name).toBe(mockUser.displayName);
  });

  it('should navigate to login page when user is not authenticated', () => {
    const { startListeningForFirebaseChanges } = useAuthentication();

    const mockUndefinedUser: Partial<FirebaseUser | undefined> = undefined;

    mockAuthenticatedFirebaseUser(mockUndefinedUser);

    startListeningForFirebaseChanges();

    expect(replace).toHaveBeenCalledWith({
      name: constants.routes.login,
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
        (_: Auth, onAuthStateChangedCallback: NextOrObserver<FirebaseUser>) => {
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
