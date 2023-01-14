import ListableObject from './listableObject';
import { INote, ObjectData } from './models';

export default class Note extends ListableObject implements INote {
  noteContent = '';

  public constructor(noteData: ObjectData) {
    super(noteData);
    Object.assign(this, noteData);
  }
}
