import User from '@/models/user';
import { firebaseAuth } from '@/boot/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useUser } from './useUser';
import UserService from '@/services/UserService';

export function useAuthentication() {
  const { setCurrentUser, getCurrentUserId, user } = useUser();

  const startListeningForFirebaseChanges = () => {
    try {
      onAuthStateChanged(firebaseAuth, (firebaseUser) => {
        console.log(firebaseUser);
        if (firebaseUser) {
          // User was authenticated or is anonymous (isAnonimous = true)
          // Firebase can pull this info from local IndexedDB is no network found
          setCurrentUser(
            new User({
              name: firebaseUser.displayName ?? '',
              email: firebaseUser.email ?? '',
              id: firebaseUser.uid,
              photoURL: firebaseUser.photoURL ?? '',
            })
          );

          onUserLoggedIn();
        } else {
          // No network found and no local firebase storage
          setCurrentUser(createAnonymousUser());
          onUserLoggedOut();
        }
      });
    } catch (error) {
      setCurrentUser(createAnonymousUser());
      onUserLoggedOut();
    }
  };

  const onUserLoggedIn = async () => {
    const photoURL = await UserService.getUserPhotoURLFromStorage(
      getCurrentUserId()
    );

    if (!photoURL) {
      await UserService.validateRegisteredUser(user.value);
    } else {
      updatePhotoURL(photoURL);
    }
  };

  const createAnonymousUser = (): User => {
    return new User({});
  };

  const onUserLoggedOut = async () => {
    //todo
  };

  const updatePhotoURL = (photoUrl: string): void => {
    // todo
  };

  return {
    startListeningForFirebaseChanges,
  };
}
