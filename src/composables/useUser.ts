import { ref } from 'vue';
import { User as FirebaseUser } from 'firebase/auth';
import User from '@/models/user';
import Constants from '@/util/constants';
import UserService from '@/services/UserService';

const anonymousUser = new User({ id: Constants.user.anonymous });

const user = ref<User>(anonymousUser);

export function useUser() {
  const validateLoggedUser = () => {
    if (!user.value.isLoggedIn) {
      throw new Error('User not logged in');
    }
  };

  const getUserFavorites = () => {
    return user.value.favorites;
  };

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
      validateLoggedUser();
      user.value.photoURL = photoURL;
      return UserService.updateUserPhoto(user.value);
    },

    setUserLocation: (location: string) => {
      validateLoggedUser();
      user.value.location = location;
      return UserService.updateUserLocation(user.value);
    },

    addToFavorites: (favoriteId: string) => {
      validateLoggedUser();
      user.value.addToFavorites(favoriteId);
      return UserService.addToFavorites(user.value, favoriteId);
    },

    removeFromFavorites: (favoriteId: string) => {
      validateLoggedUser();
      user.value.removeFromFavorites(favoriteId);
      return UserService.removeFromFavorites(user.value, favoriteId);
    },

    getUsersList: async () => {
      const users = (await UserService.getUsersList()) ?? [];
      return users.filter(({ id }) => id !== user.value.id);
    },

    getUserFavorites,
  };
}
