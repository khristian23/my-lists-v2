import { ref } from 'vue';
import User from '@/models/user';

const user = ref<User>(new User({}));

export default function useUser() {
  return {
    user,
  };
}
