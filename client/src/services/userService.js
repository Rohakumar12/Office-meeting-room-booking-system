import api from './api';

export const userService = {
  uploadProfileImage: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.post('/users/profile-image', formData);
    return response.data;
  },
};
