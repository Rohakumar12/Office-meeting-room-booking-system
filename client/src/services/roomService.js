import api from './api';

export const roomService = {
  getRooms: async (params = {}) => {
    const response = await api.get('/rooms', { params });
    return response.data;
  },

  getRoomById: async (id) => {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  },

  createRoom: async (roomData) => {
    const response = await api.post('/rooms', roomData);
    return response.data;
  },

  updateRoom: async (id, roomData) => {
    const response = await api.put(`/rooms/${id}`, roomData);
    return response.data;
  },

  deleteRoom: async (id) => {
    const response = await api.delete(`/rooms/${id}`);
    return response.data;
  },

  getAvailableRooms: async (params = {}) => {
    const response = await api.get('/rooms/available', { params });
    return response.data;
  },

  getRoomSchedule: async (id, date) => {
    const response = await api.get(`/rooms/${id}/schedule`, { params: { date } });
    return response.data;
  },

  uploadRoomImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/rooms/image', formData);
    return response.data;
  },
};
