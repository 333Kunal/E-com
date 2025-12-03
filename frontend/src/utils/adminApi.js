import api from './api';

// Get all users
export const getAllUsers = async () => {
  const response = await api.get('/admin/users/all');
  return response.data;
};

// Create new user
export const createUser = async (userData) => {
  const response = await api.post('/admin/users/create', userData);
  return response.data;
};

// Update user
export const updateUser = async (id, userData) => {
  const response = await api.put(`/admin/users/update/${id}`, userData);
  return response.data;
};

// Delete user
export const deleteUser = async (id) => {
  const response = await api.delete(`/admin/users/delete/${id}`);
  return response.data;
};

// Get single user
export const getUserById = async (id) => {
  const response = await api.get(`/admin/users/${id}`);
  return response.data;
};