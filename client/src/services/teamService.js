import api from './Api';

export const createTeam = async (teamData) => {
  const { data } = await api.post('/teams', teamData);
  return data;
};

export const getAllTeams = async () => {
  const { data } = await api.get('/teams');
  return data;
};

export const getMyTeam = async () => {
  const { data } = await api.get('/teams/my-team');
  return data;
};

export const getTeamById = async (id) => {
  const { data } = await api.get(`/teams/${id}`);
  return data;
};

export const updateTeam = async (id, teamData) => {
  const { data } = await api.put(`/teams/${id}`, teamData);
  return data;
};

export const deleteTeam = async (id) => {
  const { data } = await api.delete(`/teams/${id}`);
  return data;
};