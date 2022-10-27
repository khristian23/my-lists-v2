/*
 * Copyright (C) mailto:christian.montoya@gmail.com
 */

import { describe, it, expect } from 'vitest';
import { useUser } from '@/composables/useUser';
import Constants from '@/util/constants';
import User from '@/models/user';

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

    const currentUser = new User({
      name: 'Test User',
      id: 'TestUserID',
      email: 'testuser@test.com',
    });

    setCurrentUser(currentUser);

    expect(getCurrentUserRef().value.name).toBe('Test User');
    expect(getCurrentUserId()).toBe('TestUserID');
  });

  it('should set current user photo', () => {
    const { setCurrentUserPhotoURL, getCurrentUserRef } = useUser();
    const photoUrl = 'https://photo.url';

    setCurrentUserPhotoURL(photoUrl);

    expect(getCurrentUserRef().value.photoURL).toBe(photoUrl);
  });
});
