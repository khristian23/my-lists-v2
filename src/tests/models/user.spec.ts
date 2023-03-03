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

  it('should set basic user information', () => {
    const user = new User({
      name: 'Christian Montoya',
      photoURL: 'http://my.photo.url',
    });

    expect(user.name).toBe('Christian Montoya');
    expect(user.photoURL).toBe('http://my.photo.url');
    expect(user.favorites.length).toBe(0);
  });

  it('should add an item to favorite list', () => {
    const listId = 'TestListId';
    const user = new User({});

    user.addToFavorites(listId);

    expect(user.favorites).contains(listId);
  });

  it('should add an item to favorite list only once', () => {
    const listId = 'TestListId';
    const user = new User({
      favorites: ['TestListId2', listId],
    });

    user.addToFavorites(listId);

    expect(user.favorites).contains(listId);
    expect(user.favorites.length).toBe(2);
  });

  it('should remove an item from favorite list', () => {
    const listId = 'TestListId';
    const user = new User({
      favorites: ['testListId3', listId, 'testListId2'],
    });

    user.removeFromFavorites(listId);

    expect(user.favorites).not.contains(listId);
    expect(user.favorites.length).toBe(2);
  });

  it('should remove nothing from empty favorite list', () => {
    const user = new User({});

    user.removeFromFavorites('TestListId');

    expect(user.favorites.length).toBe(0);
  });

  it('should remove nothing if favorite item is not found', () => {
    const user = new User({
      favorites: ['TestListId1'],
    });

    user.removeFromFavorites('TestListId');

    expect(user.favorites.length).toBe(1);
    expect(user.favorites).contains('TestListId1');
  });
});
