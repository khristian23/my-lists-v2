import { ref } from 'vue';
import type { Ref } from 'vue';
import User from '@/models/user';
import Constants from '@/util/constants';

export interface UserComposableReturnValue {
  getCurrentUserRef: () => Ref<User>;
  setCurrentUser: (currentUser: User) => void;
  getCurrentUserId: () => string;
  setCurrentUserAsAnonymous: () => void;
  setCurrentUserPhotoURL: (photoUrl: string) => void;
}

const anonymousUser = new User({ id: Constants.user.anonymous });

const user = ref<User>(anonymousUser);

export function useUser(): UserComposableReturnValue {
  return {
    getCurrentUserRef: () => {
      console.error('user is: ' + JSON.stringify(user.value));
      return user;
    },
    setCurrentUser: (currentUser: User) => (user.value = currentUser),
    getCurrentUserId: () => user.value.id,
    setCurrentUserAsAnonymous: () => {
      user.value = anonymousUser;
      console.error('user anomy is: ' + JSON.stringify(user.value));
    },
    setCurrentUserPhotoURL: (photoURL: string) =>
      (user.value.photoURL = photoURL),
  };
}
