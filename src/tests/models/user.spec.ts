import { describe, it, expect } from 'vitest';
import User from '@/models/user';

describe('User', () => {
  it('should create an anonymous user by default', () => {
    const user = new User({});
    expect(user.isAnonymous).toBe(true);
    expect(user.isLoggedIn).toBe(false);
    expect(user.initials).toEqual('');
  });

  it('should determine if user id logged in', () => {
    const user = new User({
      name: 'Christian Montoya',
    });
    expect(user.isLoggedIn).toBe(true);
  });

  it('should return user initials from Name', () => {
    const user = new User({
      name: 'Christian montoya',
    });

    expect(user.initials).toBe('C');
  });

  it('should return user initials from Email', () => {
    const user = new User({
      email: 'the.christian.montoya@gmail.com',
    });

    expect(user.initials).toBe('T');
  });
});
