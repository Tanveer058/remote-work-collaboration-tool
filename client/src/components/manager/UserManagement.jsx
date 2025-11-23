import { useState } from 'react';
import { createUser, updateUser, deleteUser } from '../../services/userService';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import CloseIcon from '@mui/icons-material/Close';
import WarningIcon from '@mui/icons-material/Warning';
import { toast } from 'react-toastify';

const UserManagement = ({ users = [], onUserUpdate }) => {
  const [editingUser, setEditingUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [formData, setFormData] = useState({});
  const [createFormData, setCreateFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member'
  });
  const [loading, setLoading] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'manager':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25';
      case 'teamlead':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25';
      case 'member':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/25';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'manager':
        return '👔';
      case 'teamlead':
        return '🎯';
      case 'member':
        return '👤';
      default:
        return '💼';
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user._id);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'member',
    });
  };

  const handleUpdate = async (userId) => {
    setLoading(userId);
    try {
      await updateUser(userId, formData);
      setEditingUser(null);
      toast.success('User updated successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      onUserUpdate && onUserUpdate();
    } catch (error) {
      console.error('Update error:', error);
      toast.error(
        error.response?.data?.message || 'Failed to update user. Please try again.', 
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } finally {
      setLoading(null);
    }
  };

  const handleCreate = async () => {
    setLoading('create');
    try {
      await createUser(createFormData);
      setShowCreateModal(false);
      setCreateFormData({
        name: '',
        email: '',
        password: '',
        role: 'member'
      });
      toast.success('User created successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      onUserUpdate && onUserUpdate();
    } catch (error) {
      console.error('Create error:', error);
      toast.error(
        error.response?.data?.message || 'Failed to create user. Please try again.', 
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (userId) => {
    setDeletingUser(userId);
    try {
      await deleteUser(userId);
      setUserToDelete(null);
      toast.success('User deleted successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      onUserUpdate && onUserUpdate();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(
        error.response?.data?.message || 'Failed to delete user. Please try again.', 
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } finally {
      setDeletingUser(null);
    }
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
  };

  const cancelDelete = () => {
    setUserToDelete(null);
  };

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6">
        <div className="text-center">
          <PersonIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No users found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Start by creating the first user for your organization
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center space-x-2 mx-auto"
          >
            <AddIcon className="h-5 w-5" />
            <span>Create User</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">User</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Role</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => {
              const isEditing = editingUser === user._id;
              return (
                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200">
                  {/* User Name */}
                  <td className="px-4 py-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter user name"
                      />
                    ) : (
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                          <PersonIcon className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {user.name || 'Unnamed User'}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Email */}
                  <td className="px-4 py-4">
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter email address"
                      />
                    ) : (
                      <span className="text-sm text-gray-900 dark:text-white font-medium">
                        {user.email}
                      </span>
                    )}
                  </td>

                  {/* Role */}
                  <td className="px-4 py-4">
                    {isEditing ? (
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="manager">Manager</option>
                        <option value="teamlead">Team Lead</option>
                        <option value="member">Member</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getRoleBadgeColor(user.role)}`}>
                        <span className="mr-1">{getRoleIcon(user.role)}</span>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdate(user._id)}
                          disabled={loading === user._id}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-xs font-medium py-2 px-3 rounded-lg transition-all duration-300 flex items-center gap-1"
                        >
                          {loading === user._id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <SaveIcon className="h-4 w-4" />
                              <span>Save</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setEditingUser(null)}
                          disabled={loading === user._id}
                          className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 disabled:bg-gray-200 disabled:dark:bg-gray-700 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200 text-xs font-medium py-2 px-3 rounded-lg transition-all duration-300 flex items-center gap-1"
                        >
                          <CancelIcon className="h-4 w-4" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-lg transition-all duration-300"
                          title="Edit User"
                        >
                          <EditIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(user)}
                          className="p-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-lg transition-all duration-300"
                          title="Delete User"
                        >
                          <DeleteIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create User Button */}
      <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
        >
          <AddIcon className="h-5 w-5" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <PersonIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Create New User
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Add a new user to the system
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                disabled={loading === 'create'}
              >
                <CloseIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center">
                    <PersonIcon className="h-4 w-4 mr-2 text-gray-500" />
                    Full Name *
                  </div>
                </label>
                <input
                  type="text"
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter user's full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center">
                    <EmailIcon className="h-4 w-4 mr-2 text-gray-500" />
                    Email Address *
                  </div>
                </label>
                <input
                  type="email"
                  value={createFormData.email}
                  onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center">
                    <BadgeIcon className="h-4 w-4 mr-2 text-gray-500" />
                    Password *
                  </div>
                </label>
                <input
                  type="password"
                  value={createFormData.password}
                  onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter temporary password"
                  required
                  minLength="6"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  User will be asked to change this password on first login
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center">
                    <BadgeIcon className="h-4 w-4 mr-2 text-gray-500" />
                    Role *
                  </div>
                </label>
                <select
                  value={createFormData.role}
                  onChange={(e) => setCreateFormData({ ...createFormData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="manager">👔 Manager</option>
                  <option value="teamlead">🎯 Team Lead</option>
                  <option value="member">👤 Team Member</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={loading === 'create'}
                className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 disabled:bg-gray-200 disabled:dark:bg-gray-700 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200 font-medium py-2 px-6 rounded-lg transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={loading === 'create'}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-lg transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                {loading === 'create' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <PersonIcon className="h-5 w-5" />
                    <span>Create User</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <WarningIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Delete User
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              <button
                onClick={cancelDelete}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                disabled={deletingUser}
              >
                <CloseIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Are you sure you want to delete the user <strong>"{userToDelete.name}"</strong>?
              </p>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-2">
                  <WarningIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                      Warning: This action is permanent
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                      All user data, including their tasks and submissions, will be permanently removed from the system.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={cancelDelete}
                disabled={deletingUser}
                className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 disabled:bg-gray-200 disabled:dark:bg-gray-700 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200 font-medium py-2 px-6 rounded-lg transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(userToDelete._id)}
                disabled={deletingUser}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-lg transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                {deletingUser ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <DeleteIcon className="h-5 w-5" />
                    <span>Delete User</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserManagement;