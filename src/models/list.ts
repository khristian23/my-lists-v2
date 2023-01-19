import { sortByPriorityAndName } from '@/composables/useCommons';
import { IList, IListItem, ListableData } from '@/models/models';
import constants from '@/util/constants';
import ListableObject from './listableObject';

export default class List extends ListableObject implements IList {
  numberOfItems = 0;
  items: Array<IListItem> = [];

  constructor(listData: ListableData) {
    super(listData);
  }

  get pendingItems() {
    return this.items
      .filter(({ status }) => status === constants.itemStatus.pending)
      .sort(sortByPriorityAndName);
  }

  get doneItems() {
    return this.items
      .filter(({ status }) => status === constants.itemStatus.done)
      .sort(sortByPriorityAndName);
  }

  get hasPendingItems() {
    return !!this.pendingItems.length;
  }

  get hasDoneItems() {
    return !!this.doneItems.length;
  }
}
