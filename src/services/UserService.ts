import User from '@/models/user';

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
};
