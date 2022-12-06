import {
  Auditable,
  ListItemData,
  ListItemStatus,
  ManageableItem,
} from './models';
import constants from '@/util/constants';

export default class ListItem implements ManageableItem, Auditable {
  id!: string;
  name!: string;

  priority = 0;
  actionIcon = constants.itemActionIcon.edit;
  canBeDeleted = true;

  status: ListItemStatus = constants.itemStatus.pending;
  notes = '';
  listId!: string;

  owner = '';
  changedBy = '';
  modifiedAt = 0;

  constructor(listItemData: Partial<ListItemData>) {
    Object.assign(this, listItemData);
  }
}
