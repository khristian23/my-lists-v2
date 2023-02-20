import User from '@/models/user';
import {
  getDocs,
  query,
  collection,
  getDoc,
  doc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { firestore } from '@/boot/firebase';
import { UserConverter } from './FirebaseConverters';

export default {
  async getUserPhotoURLFromStorage(userId: string): Promise<string> {
    const userRef = doc(firestore, 'users', userId);
    const userSnapshot = await getDoc(userRef);
    if (userSnapshot.exists()) {
      return userSnapshot.data().photoURL;
    }
    throw new Error('User not found');
  },

  async addAuthenticatedUserToListApplication(user: User): Promise<void> {
    const userRef = doc(firestore, 'users', user.id);
    const userSnapShot = await getDoc(userRef);

    if (!userSnapShot.exists()) {
      const usersCollection = collection(firestore, 'users');
      await setDoc(doc(usersCollection, user.id), {
        id: user.id,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL,
      });
    }
  },

  async updateUserLocation(user: User, location: string): Promise<void> {
    const userRef = doc(firestore, 'users', user.id);

    return updateDoc(userRef, {
      location,
    });
  },

  async getUsersList(): Promise<Array<User>> {
    const usersCollection = await collection(firestore, 'users').withConverter(
      new UserConverter()
    );

    const usersQuery = query(usersCollection);

    const usersSnapshots = await getDocs(usersQuery);

    return usersSnapshots.docs.map((snapshot) => snapshot.data());
  },
};
