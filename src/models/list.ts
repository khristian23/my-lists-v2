import { BaseItem, ListData, ManageableItem } from '@/models/models';
import Consts from '@/util/constants';

export default class List implements BaseItem, ManageableItem {
  id: string;
  type: string;
  name: string;
  description: string;

  actionIcon = Consts.itemActionIcon.edit;
  canBeDeleted = true;
  numberOfItems = 0;
  priority = 0;

  constructor(listData: ListData) {
    this.id = listData.id;
    this.type = listData.type;
    this.name = listData.name;
    this.description = listData.description ?? '';
  }
}
