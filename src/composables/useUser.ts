import { ref } from 'vue';
import type { Ref } from 'vue';
import User from '@/models/user';
import Constants from '@/util/constants';

export interface UserComposableReturnValue {
  user: Ref<User>;
  setCurrentUser: (currentUser: User) => void;
  getCurrentUserId: () => string;
}

const user = ref<User>(new User({ id: Constants.user.anonymous }));

export function useUser(): UserComposableReturnValue {
  return {
    user,
    setCurrentUser: (currentUser: User) => (user.value = currentUser),
    getCurrentUserId: () => user.value.id,
  };
}
