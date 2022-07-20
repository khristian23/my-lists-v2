import { ListData, ManageableItem } from '@/models/models';

export default class List implements ManageableItem {
  id: string;
  type: string;
  name: string;
  description: string;

  constructor(listData: ListData) {
    this.id = listData.id;
    this.type = listData.type;
    this.name = listData.name;
    this.description = listData.description ?? '';
  }
}
