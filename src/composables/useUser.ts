import { ref } from 'vue';
import { User as FirebaseUser } from 'firebase/auth';
import User from '@/models/user';
import Constants from '@/util/constants';
import UserService from '@/services/UserService';

const anonymousUser = new User({ id: Constants.user.anonymous });

const user = ref<User>(anonymousUser);

export function useUser() {
  return {
    createUserFromFirebaseUser: (firebaseUser: FirebaseUser): User =>
      new User({
        name: firebaseUser.displayName ?? '',
        email: firebaseUser.email ?? '',
        id: firebaseUser.uid,
        photoURL: firebaseUser.photoURL ?? '',
      }),

    loadCurrentUserDetails: async () => {
      try {
        user.value = await UserService.getUserById(user.value.id);
      } catch (e: unknown) {
        if ((e as Error).message === 'User not found') {
          UserService.addAuthenticatedUserToListApplication(user.value);
        }
      }
    },

    getCurrentUserRef: () => {
      return user;
    },

    setCurrentUser: (currentUser: User) => (user.value = currentUser),

    getCurrentUserId: () => user.value.id,

    setCurrentUserAsAnonymous: () => {
      user.value = anonymousUser;
    },

    setCurrentUserPhotoURL: (photoURL: string) => {
      user.value.photoURL = photoURL;
      UserService.updateUserPhoto(user.value);
    },

    setUserLocation: (location: string) => {
      user.value.location = location;
      UserService.updateUserLocation(user.value);
    },

    getUsersList: async () => {
      const users = (await UserService.getUsersList()) ?? [];
      return users.filter(({ id }) => id !== user.value.id);
    },
  };
}
