import { useState } from 'react';
import { deleteTeam, updateTeam } from '../../services/teamService';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';

const TeamManagement = ({ teams, users, onTeamUpdate }) => {
  const [editingTeam, setEditingTeam] = useState(null);
  const [formData, setFormData] = useState({});

  const teamLeads = users.filter(u => u.role === 'teamlead');
  const members = users.filter(u => u.role === 'member');

  const handleEdit = (team) => {
    setEditingTeam(team._id);
    setFormData({
      name: team.name,
      description: team.description || '',
      teamLead: team.teamLead?._id || '',
      members: team.members?.map(m => m._id) || []
    });
  };

  const handleUpdate = async (teamId) => {
    try {
      await updateTeam(teamId, formData);
      setEditingTeam(null);
      onTeamUpdate();
    } catch (error) {
      alert('Error updating team: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (teamId) => {
    if (window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      try {
        await deleteTeam(teamId);
        onTeamUpdate();
      } catch (error) {
        alert('Error deleting team: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleMemberToggle = (memberId) => {
    const currentMembers = formData.members || [];
    if (currentMembers.includes(memberId)) {
      setFormData({
        ...formData,
        members: currentMembers.filter(id => id !== memberId)
      });
    } else {
      setFormData({
        ...formData,
        members: [...currentMembers, memberId]
      });
    }
  };

  if (teams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6">
        <div className="text-center">
          <GroupIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No teams created yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Click "Create Team" to get started!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {teams.map((team, index) => (
        <div key={team._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200">
          {editingTeam === team._id ? (
            /* Edit Mode */
            <div className="space-y-6">
              {/* Team Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Team Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Team Name"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Team Description"
                  rows="2"
                />
              </div>

              {/* Team Lead */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Team Lead *
                </label>
                <select
                  value={formData.teamLead}
                  onChange={(e) => setFormData({ ...formData, teamLead: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Team Lead</option>
                  {teamLeads.map(lead => (
                    <option key={lead._id} value={lead._id}>
                      {lead.name} ({lead.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Team Members */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Team Members
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2 border border-gray-200 dark:border-gray-600 rounded-md">
                  {members.map(member => (
                    <label key={member._id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-md cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.members?.includes(member._id) || false}
                        onChange={() => handleMemberToggle(member._id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {member.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {member.email}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => handleUpdate(team._id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center space-x-2"
                >
                  <SaveIcon className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>
                <button
                  onClick={() => setEditingTeam(null)}
                  className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center space-x-2"
                >
                  <CancelIcon className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <>
              {/* Header with team info and actions */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <GroupIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {team.name}
                      </h3>
                      {team.description && (
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          {team.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(team)}
                    className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-lg transition-all duration-300 transform hover:scale-110"
                    title="Edit Team"
                  >
                    <EditIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(team._id)}
                    className="p-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-lg transition-all duration-300 transform hover:scale-110"
                    title="Delete Team"
                  >
                    <DeleteIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Team Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Team Lead Section */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <PersonIcon className="h-4 w-4 text-purple-500" />
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Team Lead
                    </h4>
                  </div>
                  {team.teamLead ? (
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                      <div className="font-medium text-purple-800 dark:text-purple-200">
                        {team.teamLead.name}
                      </div>
                      <div className="text-sm text-purple-600 dark:text-purple-400">
                        {team.teamLead.email}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 dark:text-gray-400 text-sm">
                      No team lead assigned
                    </div>
                  )}
                </div>

                {/* Team Members Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <GroupIcon className="h-4 w-4 text-green-500" />
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Team Members
                      </h4>
                    </div>
                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium px-2 py-1 rounded-full">
                      {team.members?.length || 0}
                    </span>
                  </div>
                  {team.members && team.members.length > 0 ? (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {team.members.map(member => (
                        <div key={member._id} className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                          <div className="font-medium text-green-800 dark:text-green-200">
                            {member.name}
                          </div>
                          <div className="text-sm text-green-600 dark:text-green-400">
                            {member.email}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 dark:text-gray-400 text-sm">
                      No members assigned
                    </div>
                  )}
                </div>
              </div>

              {/* Created By Info */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Created by: {team.createdBy?.name || 'Unknown'}
                  {' • '}
                  {new Date(team.createdAt).toLocaleDateString()}
                </p>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default TeamManagement;