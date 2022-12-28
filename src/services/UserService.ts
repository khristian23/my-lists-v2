import User from '@/models/user';
import { getDocs, query, collection } from 'firebase/firestore';
import { firestore } from '@/boot/firebase';
import { UserConverter } from './FirebaseConverters';

export default {
  async getUserPhotoURLFromStorage(userId: string): Promise<string> {
    throw new Error('not implemented');
  },

  async addAuthenticatedUserToListApplication(user: User): Promise<void> {
    throw new Error('not implemented');
  },

  async updateUserLocation(user: User, location: string): Promise<void> {
    throw new Error('not implemented');
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
