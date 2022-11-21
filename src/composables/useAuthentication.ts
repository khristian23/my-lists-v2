import User from '@/models/user';
import { firebaseAuth } from '@/boot/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  User as FirebaseUser,
} from 'firebase/auth';
import { useUser } from './useUser';
import UserService from '@/services/UserService';
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
          // User Signed Out
          handleFirebaseUserNotAuthenticated();
        }
      });
    } catch (error) {
      // No network found and no local firebase storage
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

    replace({ name: constants.routes.lists.name });

    return Promise.all([
      UserService.addAuthenticatedUserToListApplication(user),
      setUserPhotoFromApplication(),
    ]);
  };

  const handleFirebaseUserNotAuthenticated = () => {
    setCurrentUserAsAnonymous();
    replace({ name: constants.routes.login.name });
  };

  const setUserPhotoFromApplication = async () => {
    const photoURL = await UserService.getUserPhotoURLFromStorage(
      getCurrentUserId()
    );

    setCurrentUserPhotoURL(photoURL);
  };

  const loginWithEmailAndPassword = (email: string, password: string) => {
    return signInWithEmailAndPassword(firebaseAuth, email, password);
  };

  let googleAuthProvider = new GoogleAuthProvider();

  const setGoogleAuthProvider = (
    injectedGoogleAuthProvider: GoogleAuthProvider
  ) => {
    googleAuthProvider = injectedGoogleAuthProvider;
  };

  const loginWithGoogleRedirect = async () => {
    return signInWithRedirect(firebaseAuth, googleAuthProvider);
  };

  const checkForRedirectAfterAuthentication = async () => {
    const userCredential = await getRedirectResult(firebaseAuth);
    if (userCredential?.user) {
      replace({ name: constants.routes.lists.name });
    }
  };

  return {
    startListeningForFirebaseChanges,
    loginWithEmailAndPassword,
    loginWithGoogleRedirect,
    setGoogleAuthProvider,
    checkForRedirectAfterAuthentication,
  };
}
