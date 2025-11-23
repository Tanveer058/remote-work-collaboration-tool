import api from './Api';

export const createTask = async (taskData) => {
  const { data } = await api.post('/tasks', taskData);
  return data;
};

export const getTeamTasks = async () => {
  const { data } = await api.get('/tasks/team');
  return data;
};

export const getMyTasks = async () => {
  const { data } = await api.get('/tasks/my-tasks');
  return data;
};

export const updateTaskStatus = async (id, status) => {
  const { data } = await api.put(`/tasks/${id}/status`, { status });
  return data;
};

export const submitTask = async (id, formData) => {
  const { data } = await api.post(`/tasks/${id}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};
// export const submitTask = async (taskId, formData) => {
//   try {
//     const response = await axios.post(`/api/tasks/${taskId}/submit`, formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

export const updateTask = async (id, taskData) => {
  const { data } = await api.put(`/tasks/${id}`, taskData);
  return data;
};

export const deleteTask = async (id) => {
  const { data } = await api.delete(`/tasks/${id}`);
  return data;
};