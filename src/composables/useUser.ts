import { ref } from 'vue';
import User from '@/models/user';
import Constants from '@/util/constants';

const user = ref<User>(new User({ id: Constants.user.anonymous }));

export function useUser() {
  return {
    user,
    getCurrentUserId: () => user.value.id,
  };
}
