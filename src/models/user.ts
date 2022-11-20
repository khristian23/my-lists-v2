import { UserData } from '@/models/models';
import Constants from '@/util/constants';
import { format } from 'quasar';

export default class User {
  id: string;
  readonly _name?: string;
  photoURL: string;
  email: string;
  location: string;

  constructor(userData: Partial<UserData>) {
    this.id = userData.id ?? '';
    this._name = userData.name ?? '';
    this.photoURL = userData.photoURL ?? '';
    this.email = userData.email ?? '';
    this.location = userData.location ?? '';
  }

  get name() {
    if (this.isAnonymous) {
      return Constants.user.anonymous;
    }
    return this._name;
  }

  get isAnonymous() {
    return !this._name?.trim().length && !this.email.trim().length;
  }

  get isLoggedIn() {
    return !this.isAnonymous;
  }

  get initials() {
    if (this.isLoggedIn) {
      const name = this.name || this.email;
      if (name) {
        return format.capitalize(name.substring(0, 1));
      }
    }
    return '';
  }
}
