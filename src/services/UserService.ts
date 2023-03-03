import User from '@/models/user';
import {
  getDocs,
  query,
  collection,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  FieldValue,
  arrayRemove,
} from 'firebase/firestore';
import { firestore } from '@/boot/firebase';
import { UserConverter } from './FirebaseConverters';

export default {
  async getUserById(userId: string): Promise<User> {
    const userRef = doc(firestore, 'users', userId).withConverter(
      new UserConverter()
    );
    const userSnapshot = await getDoc(userRef);
    if (userSnapshot.exists()) {
      return userSnapshot.data();
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

  async updateUserDetails(
    user: User,
    updateObject: { [k: string]: string | FieldValue }
  ) {
    const userRef = doc(firestore, 'users', user.id);

    return updateDoc(userRef, updateObject);
  },

  async updateUserLocation(user: User): Promise<void> {
    return this.updateUserDetails(user, {
      location: user.location,
    });
  },

  async updateUserPhoto(user: User): Promise<void> {
    return this.updateUserDetails(user, {
      photoURL: user.photoURL,
    });
  },

  async addToFavorites(user: User, favoriteId: string): Promise<void> {
    return this.updateUserDetails(user, {
      favorites: arrayUnion(favoriteId),
    });
  },

  async removeFromFavorites(user: User, favoriteId: string): Promise<void> {
    return this.updateUserDetails(user, {
      favorites: arrayRemove(favoriteId),
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
