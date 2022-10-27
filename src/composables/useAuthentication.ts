import User from '@/models/user';
import { firebaseAuth } from '@/boot/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useUser } from './useUser';
import UserService from '@/services/UserService';
import { User as FirebaseUser } from 'firebase/auth';
import { useRouter } from 'vue-router';
import constants from '@/util/constants';

export function useAuthentication() {
  const {
    setCurrentUser,
    getCurrentUserId,
    setCurrentUserPhotoURL,
    setCurrentUserAsAnonymous,
  } = useUser();

  const { replace } = useRouter();

  const startListeningForFirebaseChanges = () => {
    try {
      onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
        if (firebaseUser) {
          // User was authenticated or is anonymous (isAnonimous = true)
          // Firebase can pull this info from local IndexedDB is no network found
          await handleFirebaseUserAuthenticated(firebaseUser);
        } else {
          // No network found and no local firebase storage
          handleFirebaseUserNotAuthenticated();
        }
      });
    } catch (error) {
      handleFirebaseUserNotAuthenticated();
    }
  };

  const handleFirebaseUserAuthenticated = async (
    firebaseUser: FirebaseUser
  ) => {
    const user = new User({
      name: firebaseUser.displayName ?? '',
      email: firebaseUser.email ?? '',
      id: firebaseUser.uid,
      photoURL: firebaseUser.photoURL ?? '',
    });

    setCurrentUser(user);

    return Promise.all([
      UserService.addAuthenticatedUserToListApplication(user),
      setUserPhotoFromApplication(),
    ]);
  };

  const handleFirebaseUserNotAuthenticated = () => {
    setCurrentUserAsAnonymous();
    replace({ name: constants.routes.login });
  };

  const setUserPhotoFromApplication = async () => {
    const photoURL = await UserService.getUserPhotoURLFromStorage(
      getCurrentUserId()
    );

    setCurrentUserPhotoURL(photoURL);
  };

  return {
    startListeningForFirebaseChanges,
  };
}
