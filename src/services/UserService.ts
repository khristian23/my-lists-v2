import User from '@/models/user';

export default {
  async getUserPhotoURLFromStorage(userId: string): Promise<string> {
    return Promise.resolve('photoUrl');
  },

  async validateRegisteredUser(user: User): Promise<void> {
    // todo
  },
};
