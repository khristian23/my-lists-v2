import { firebaseAuth } from '@/boot/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { useUser } from './useUser';
import { useRouter } from 'vue-router';
import constants from '@/util/constants';
import UserRegistrar from '@/models/userRegistrar';

export function useAuthentication() {
  const {
    createUserFromFirebaseUser,
    setCurrentUser,
    loadCurrentUserDetails,
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
    const user = createUserFromFirebaseUser(firebaseUser);
    setCurrentUser(user);

    replace({ name: constants.routes.lists.name });

    return loadCurrentUserDetails();
  };

  const handleFirebaseUserNotAuthenticated = () => {
    setCurrentUserAsAnonymous();
    replace({ name: constants.routes.login.name });
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

  const registerUser = async ({ email, password, name }: UserRegistrar) => {
    await createUserWithEmailAndPassword(firebaseAuth, email, password);

    if (firebaseAuth.currentUser) {
      await updateProfile(firebaseAuth.currentUser, {
        displayName: name,
      });
    }
  };

  const logoutUser = () => {
    firebaseAuth.signOut();

    setCurrentUserAsAnonymous();
  };

  return {
    startListeningForFirebaseChanges,
    loginWithEmailAndPassword,
    loginWithGoogleRedirect,
    setGoogleAuthProvider,
    checkForRedirectAfterAuthentication,
    registerUser,
    logoutUser,
  };
}
