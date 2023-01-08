import ListItem from '@/models/listItem';
import constants from '@/util/constants';
import { describe, it, expect } from 'vitest';

describe('List items', () => {
  it('should get edit icon when using a default list type', () => {
    const listItem = new ListItem({});
    listItem.parentListType = constants.listType.note;

    expect(listItem.actionIcon).toBe(constants.itemActionIcon.edit);
  });

  it('should get done icon when status is Pending in a todo list type', () => {
    const listItem = new ListItem({ status: constants.itemStatus.pending });
    listItem.parentListType = constants.listType.toDoList;

    expect(listItem.actionIcon).toBe(constants.itemActionIcon.done);
  });

  it('should get redo icon when status is Done in a shoppingcart list type', () => {
    const listItem = new ListItem({ status: constants.itemStatus.done });
    listItem.parentListType = constants.listType.shoppingCart;

    expect(listItem.actionIcon).toBe(constants.itemActionIcon.redo);
  });

  it('should get redo icon when status is Done in a wishlist list type', () => {
    const listItem = new ListItem({ status: constants.itemStatus.done });
    listItem.parentListType = constants.listType.whishlist;

    expect(listItem.actionIcon).toBe(constants.itemActionIcon.redo);
  });

  it('should get an unchecked icon when status is Pending in a checklist list type', () => {
    const listItem = new ListItem({ status: constants.itemStatus.pending });
    listItem.parentListType = constants.listType.checklist;

    expect(listItem.actionIcon).toBe(constants.itemActionIcon.unchecked);
  });

  it('should get checked icon when status is Done in a checklist list type', () => {
    const listItem = new ListItem({ status: constants.itemStatus.done });
    listItem.parentListType = constants.listType.checklist;

    expect(listItem.actionIcon).toBe(constants.itemActionIcon.checked);
  });
});
