import { ref } from 'vue';
import User from '@/models/user';
import Constants from '@/util/constants';
import UserService from '@/services/UserService';

const anonymousUser = new User({ id: Constants.user.anonymous });

const user = ref<User>(anonymousUser);

export function useUser() {
  return {
    getCurrentUserRef: () => {
      return user;
    },
    setCurrentUser: (currentUser: User) => (user.value = currentUser),
    getCurrentUserId: () => user.value.id,
    setCurrentUserAsAnonymous: () => {
      user.value = anonymousUser;
    },
    setCurrentUserPhotoURL: (photoURL: string) =>
      (user.value.photoURL = photoURL),
    logoutUser: () => {
      throw new Error('not implemented');
    },
    setUserLocation: (location: string) => {
      user.value.location = location;
      UserService.updateUserLocation(user.value, location);
    },
    getUsersList: async () => {
      const users = (await UserService.getUsersList()) ?? [];
      return users.filter(({ id }) => id !== user.value.id);
    },
  };
}
