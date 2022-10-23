import { describe, it, expect, vi } from 'vitest';
import { firebaseAuth } from '@/boot/firebase';
import { useAuthentication } from '@/composables/useAuthentication';
// import { Unsubscribe } from 'firebase/auth';

// const onAuthStateChanged = vi.fn(() => {
//   return Promise.resolve('result of onAuthStateChanged');
// });

//vi.mock('@/boot/firebase');
// vi.mock('@/boot/firebase', () => ({
//   firebaseAuth: {
//     onAuthStateChanged: vi.fn((obj, callback) => {
//       callback(obj);
//     }),
//   },
// }));

// /**
// * Firebase Auth Module
// */
// vi.mock('firebase/auth', () => {
//   const authInstance = {
//     // while handshaking with the Firebase Auth servers, currentUser
//     // is null, regardless if someone is logged in or not.
//     currentUser: null
//   };

//   const mockedUserInfo = Object.freeze({ // force read-only
//     // mocked user info here - display name, email, etc
//     email: 'example@example.com'
//   });

//   // container for attached callbacks and state variables
//   const authChangeCallbacks = [];
//   let authCurrentUserInfo = mockedUserInfo;
//   let authTimer = null;
//   let authTimerCompleted = false;

//   // invoke all callbacks with current data
//   const fireOnChangeCallbacks = () => {
//     authMock.currentUser = authCurrentUserInfo;
//     callbacks.forEach((cb) => {
//       try {
//         cb(mockedUserInfo)); // invoke any active listeners
//       } catch (err) {
//         console.error('Error invoking callback', err);
//       }
//     });
//     authTimerCompleted = true;
//   };

//   authInstance.signOut = () => { // signInWithX will look similar to this
//     authCurrentUserInfo = null;
//     fireOnChangeCallbacks();
//   };

//   return {
//     getAuth: jest.fn(() => authInstance),
//     onAuthStateChanged: jest.fn((authMock, onChangeCallback) => {
//       if (!authTimer) {
//         // increase this delay to emulate slower connections
//         authTimer = setTimeout(fireOnChangeCallbacks, 2000);
//       }

//       callbacks.push(onChangeCallback);
//       const unsubscriber = () => {
//         const foundIndex = callbacks.indexOf(onChangeCallback);
//         if (foundIndex > -1) callbacks.splice(foundIndex, 1);
//       }

//       if (authTimerCompleted) {
//         // auth is "resolved" already, fire callback immediately
//         onChangeCallback(mockedUserInfo);
//       }

//       return unsubscriber;
//     })
//   };
// });

import Auth, { onAuthStateChanged } from 'firebase/auth';
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

describe('Authentication Composable', () => {
  it('should start user authentication', () => {
    const { startListeningForFirebaseChanges } = useAuthentication();

    // vi.mocked(onAuthStateChanged)

    startListeningForFirebaseChanges();

    expect(onAuthStateChanged).toHaveBeenCalled();
  });
});
