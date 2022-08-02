import { ref } from 'vue';
import User from '@/models/user';

const user = ref<User>(new User({ id: '' }));

export function useUser() {
  return {
    user,
    getCurrentUserId: () => 'UserId',
  };
}
