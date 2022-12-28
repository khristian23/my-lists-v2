/*
 * Copyright (C) mailto:christian.montoya@gmail.com
 */

import { describe, it, expect, vi } from 'vitest';
import { useUser } from '@/composables/useUser';
import Constants from '@/util/constants';
import User from '@/models/user';
import UserService from '@/services/UserService';

const mockUser = new User({
  id: 'TestUserID',
  name: 'Test User',
  email: 'testuser@test.com',
});

describe('User Composable', () => {
  it('should provide an anonymous reactive user by default', () => {
    const { getCurrentUserRef } = useUser();

    const user = getCurrentUserRef();
    expect(user.value.isAnonymous).toBe(true);
    expect(user.value.name).toBe(Constants.user.anonymous);
    expect(user.value.id).toBe(Constants.user.anonymous);
  });

  it('should provide an anonymous current user by default', () => {
    const { getCurrentUserId } = useUser();

    expect(getCurrentUserId()).toBe(Constants.user.anonymous);
  });

  it('should set current user as anonymous', () => {
    const { setCurrentUserAsAnonymous, getCurrentUserId } = useUser();

    setCurrentUserAsAnonymous();

    expect(getCurrentUserId()).toBe(Constants.user.anonymous);
  });

  it('should set the current user with reactivity', () => {
    const { getCurrentUserRef, setCurrentUser, getCurrentUserId } = useUser();

    setCurrentUser(mockUser);

    expect(getCurrentUserRef().value.name).toBe('Test User');
    expect(getCurrentUserId()).toBe('TestUserID');
  });

  it('should set current user photo', () => {
    const { setCurrentUserPhotoURL, getCurrentUserRef } = useUser();
    const photoUrl = 'https://photo.url';

    setCurrentUserPhotoURL(photoUrl);

    expect(getCurrentUserRef().value.photoURL).toBe(photoUrl);
  });

  it('ahould set user location', () => {
    const { setUserLocation, setCurrentUser, getCurrentUserRef } = useUser();

    setCurrentUser(mockUser);

    expect(getCurrentUserRef().value.location).toBeFalsy();

    setUserLocation('Montreal, Canada');

    expect(getCurrentUserRef().value.location).toBe('Montreal, Canada');
  });

  it('should trigger user location storage', () => {
    vi.mock('@/services/UserService');

    const { setCurrentUser, setUserLocation } = useUser();

    setCurrentUser(mockUser);

    const location = 'Lima, Peru';
    setUserLocation(location);

    expect(UserService.updateUserLocation).toHaveBeenCalledWith(
      mockUser,
      location
    );
  });

  it('should list available users without including current user', async () => {
    vi.mock('@/service/UserService');

    const { setCurrentUser, getUsersList } = useUser();

    setCurrentUser(mockUser);

    vi.mocked(UserService).getUsersList.mockResolvedValue([
      new User({
        id: 'TestUser1',
        name: 'Test User',
      }),
      mockUser,
      new User({
        id: 'TestUser2',
        name: 'Test User 2',
      }),
    ]);

    const availableUsers = await getUsersList();
    expect(availableUsers.length).toBe(2);
    expect(availableUsers.find(({ id }) => id === mockUser.id)).toBeUndefined();
  });
});
