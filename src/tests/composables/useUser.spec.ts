/*
 * Copyright (C) mailto:christian.montoya@gmail.com
 */

import { describe, it, expect } from 'vitest';
import { useUser } from '@/composables/useUser';
import Constants from '@/util/constants';
import User from '@/models/user';

describe('User Composable', () => {
  it('should provide an anonymous reactive user by default', () => {
    const { user } = useUser();

    expect(user.value.isAnonymous).toBe(true);
    expect(user.value.name).toBe(Constants.user.anonymous);
    expect(user.value.id).toBe(Constants.user.anonymous);
  });

  it('should privide an anonymous current user by default', () => {
    const { getCurrentUserId } = useUser();

    expect(getCurrentUserId()).toBe(Constants.user.anonymous);
  });

  it('should set the current user with reactivity', () => {
    const { user, setCurrentUser, getCurrentUserId } = useUser();

    const currentUser = new User({
      name: 'Test User',
      id: 'TestUserID',
      email: 'testuser@test.com',
    });

    setCurrentUser(currentUser);

    expect(user.value.name).toBe('Test User');
    expect(getCurrentUserId()).toBe('TestUserID');
  });
});
