import List from '@/models/list';
import ListItem from '@/models/listItem';
import constants from '@/util/constants';
import { describe, it, expect, beforeEach } from 'vitest';

describe('List Class', () => {
  let list: List;

  beforeEach(() => {
    list = new List({});
  });

  describe('Pending and Done items', () => {
    beforeEach(() => {
      list.keepDoneItems = true;
    });

    it('should have zero items when new list', () => {
      expect(list.numberOfItems).toBe(0);
      expect(list.hasPendingItems).toBe(false);
      expect(list.hasDoneItems).toBe(false);
    });

    it('should indicate that pending and done items are found', () => {
      list.items = [
        new ListItem({ status: constants.itemStatus.done }),
        new ListItem({ status: constants.itemStatus.pending }),
        new ListItem({ status: constants.itemStatus.done }),
      ];

      expect(list.hasPendingItems).toBe(true);
      expect(list.hasDoneItems).toBe(true);
    });

    it('should indicate that only pending items are found', () => {
      list.items = [
        new ListItem({ status: constants.itemStatus.pending }),
        new ListItem({ status: constants.itemStatus.pending }),
      ];

      expect(list.hasPendingItems).toBe(true);
      expect(list.hasDoneItems).toBe(false);
    });

    it('should indicate that only pending items are found', () => {
      list.items = [
        new ListItem({ status: constants.itemStatus.done }),
        new ListItem({ status: constants.itemStatus.done }),
      ];

      expect(list.hasPendingItems).toBe(false);
      expect(list.hasDoneItems).toBe(true);
    });
  });

  describe('List not keeping Done Items', () => {
    beforeEach(() => {
      list.keepDoneItems = false;
    });

    it('should indicate that only pending items are found', () => {
      list.items = [
        new ListItem({ status: constants.itemStatus.done }),
        new ListItem({ status: constants.itemStatus.pending }),
        new ListItem({ status: constants.itemStatus.done }),
      ];

      expect(list.hasPendingItems).toBe(true);
      expect(list.hasDoneItems).toBe(false);
    });

    it('should indicate that not pending nor done items are found', () => {
      list.items = [
        new ListItem({ status: constants.itemStatus.done }),
        new ListItem({ status: constants.itemStatus.done }),
      ];

      expect(list.hasPendingItems).toBe(false);
      expect(list.hasDoneItems).toBe(false);
    });
  });

  describe('List Items', () => {
    beforeEach(() => {
      list.items = [
        new ListItem({
          status: constants.itemStatus.done,
          priority: 3,
          name: 'third done',
        }),
        new ListItem({
          status: constants.itemStatus.pending,
          priority: 0,
          name: 'zero 2 pending',
        }),
        new ListItem({
          status: constants.itemStatus.pending,
          priority: 0,
          name: 'zero 1 pending',
        }),
        new ListItem({
          status: constants.itemStatus.pending,
          priority: constants.lists.priority.lowest,
          name: 'lowest pending',
        }),
        new ListItem({
          status: constants.itemStatus.done,
          priority: 0,
          name: 'zero done',
        }),
        new ListItem({
          status: constants.itemStatus.pending,
          priority: 2,
          name: 'second pending',
        }),
        new ListItem({
          status: constants.itemStatus.pending,
          priority: 1,
          name: 'first pending',
        }),
      ];
    });

    it('should return pending items sorted by priority and name', () => {
      expect(list.pendingItems.length).toBe(5);
      expect(list.pendingItems[0].name).toBe('zero 1 pending');
      expect(list.pendingItems[2].name).toBe('first pending');
      expect(list.pendingItems[4].name).toBe('lowest pending');
    });

    it('should return done items sorted', () => {
      expect(list.doneItems.length).toBe(2);
      expect(list.doneItems[1].name).toBe('third done');
    });
  });
});
