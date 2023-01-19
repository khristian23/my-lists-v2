import ListableObject from './listableObject';
import { INote, NoteData } from './models';

export default class Note extends ListableObject implements INote {
  noteContent = '';

  public constructor(noteData: NoteData) {
    super(noteData);
    Object.assign(this, noteData);
  }
}
