import {
  IListItem,
  ListableItemData,
  ListItemStatus,
  ListType,
} from './models';
import constants from '@/util/constants';

export default class ListItem implements IListItem {
  id!: string;
  name!: string;

  priority = 0;
  private _actionIcon = constants.itemActionIcon.edit;
  private _parentListType: ListType = constants.listType.toDoList;
  canBeDeleted = true;

  status: ListItemStatus = constants.itemStatus.pending;
  notes = '';
  listId!: string;

  owner = '';
  changedBy = '';
  modifiedAt = 0;

  constructor(listItemData: ListableItemData) {
    Object.assign(this, listItemData);
  }

  set parentListType(listType: ListType) {
    this._parentListType = listType;
  }

  get actionIcon() {
    if (
      this._parentListType === constants.listType.toDoList ||
      this._parentListType === constants.listType.shoppingCart ||
      this._parentListType === constants.listType.whishlist
    ) {
      if (this.status === constants.itemStatus.pending) {
        this._actionIcon = constants.itemActionIcon.done;
      } else {
        this._actionIcon = constants.itemActionIcon.redo;
      }
    } else if (this._parentListType === constants.listType.checklist) {
      if (this.status === constants.itemStatus.pending) {
        this._actionIcon = constants.itemActionIcon.unchecked;
      } else {
        this._actionIcon = constants.itemActionIcon.checked;
      }
    }
    return this._actionIcon;
  }
}
