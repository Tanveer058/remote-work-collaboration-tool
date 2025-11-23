import api from './Api';

export const getAllUsers = async () => {
  const { data } = await api.get('/auth/users');
  return data;
};

export const createUser = async (userData) => {
  const { data } = await api.post('/auth/users', userData);
  return data;
};

export const updateUser = async (userId, userData) => {
  const { data } = await api.put(`/auth/users/${userId}`, userData);
  return data;
};

export const deleteUser = async (userId) => {
  const { data } = await api.delete(`/auth/users/${userId}`);
  return data;
};