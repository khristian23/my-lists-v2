import List from '@/models/list';
import Consts from '@/util/constants';

const BINARY = 2;

export function generateLists(numberOfLists: number): Array<List> {
  const listTypes = Object.values(Consts.listType);
  const lists: Array<List> = [];

  for (let i = 0; i < numberOfLists; i++) {
    lists.push(
      new List({
        id: `ListId${i}`,
        name: `ListName${i}`,
        type: listTypes[Math.floor(Math.random() * listTypes.length)],
        isShared: Math.floor(Math.random() * BINARY) ? true : false,
        owner: `Owner${i}`,
      })
    );
  }

  return lists;
}
