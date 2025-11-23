import { useState } from 'react';
import { format } from 'date-fns';
import { updateTask, deleteTask } from '../../services/taskService';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { toast } from 'react-toastify';

const TaskManagement = ({ tasks = [], team, onTaskUpdate, onViewSubmission, viewMode = 'table' }) => {
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({});
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [savingTask, setSavingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  // Safe date formatting
  const safeFormatDate = (dateString, formatString = 'MMM dd, yyyy') => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '—';
      return format(date, formatString);
    } catch {
      return '—';
    }
  };

  const safeCreateDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  };

  const isOverdue = (task) => {
    const deadline = safeCreateDate(task.deadline);
    return task.status !== 'completed' && deadline && deadline < new Date();
  };

  const getPriorityBadge = (priority = 'medium') => {
    const map = {
      high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    };
    return map[priority] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getStatusIcon = (task) => {
    const deadline = safeCreateDate(task.deadline);
    const submittedAt = safeCreateDate(task.submission?.submittedAt);
    if (task.status === 'completed') {
      return submittedAt && deadline && submittedAt <= deadline
        ? <CheckCircleIcon className="h-4 w-4" />
        : <WarningIcon className="h-4 w-4" />;
    }
    return deadline && deadline < new Date()
      ? <ErrorIcon className="h-4 w-4" />
      : <AssignmentIcon className="h-4 w-4" />;
  };

  const getCompletionText = (task) => {
    const deadline = safeCreateDate(task.deadline);
    const submittedAt = safeCreateDate(task.submission?.submittedAt);
    if (task.status === 'completed') {
      return submittedAt && deadline && submittedAt <= deadline
        ? 'Completed On Time'
        : 'Submitted After Deadline';
    }
    if (deadline && deadline < new Date()) return 'Deadline Passed';
    if (task.status === 'in_progress' || task.status === 'in progress') return 'In Progress';
    return 'Not Started';
  };

  const handleEdit = (task) => {
    setEditingTask(task._id);
    let formattedDeadline = '';
    try {
      if (task.deadline) {
        const date = new Date(task.deadline);
        if (!isNaN(date.getTime())) {
          formattedDeadline = format(date, 'yyyy-MM-dd');
        }
      }
    } catch {}
    setFormData({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'medium',
      deadline: formattedDeadline,
      assignedTo: task.assignedTo?._id || '',
    });
  };

  const handleUpdate = async (taskId) => {
    setSavingTask(taskId);
    try {
      await updateTask(taskId, formData);
      setEditingTask(null);
      toast.success('Task updated successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      onTaskUpdate && onTaskUpdate();
    } catch (error) {
      console.error('Update error:', error);
      toast.error(
        error.response?.data?.message || 'Failed to update task. Please try again.', 
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
      setSavingTask(null);
    }
  };

  const handleDelete = async (taskId) => {
    setDeletingTask(taskId);
    try {
      await deleteTask(taskId);
      setTaskToDelete(null);
      toast.success('Task deleted successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      onTaskUpdate && onTaskUpdate();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(
        error.response?.data?.message || 'Failed to delete task. Please try again.', 
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
      setDeletingTask(null);
    }
  };

  const confirmDelete = (task) => {
    setTaskToDelete(task);
  };

  const cancelDelete = () => {
    setTaskToDelete(null);
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6">
        <div className="text-center">
          <AssignmentIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No tasks created yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Click "Create Task" to assign work to your team members!
          </p>
        </div>
      </div>
    );
  }

  // Table view
  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Title</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Assigned To</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Deadline</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Priority</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Completion</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map((task) => {
              const isEditing = editingTask === task._id;
              return (
                <tr key={task._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200 align-top">
                  {/* Title */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter task title"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {task.title || 'Untitled Task'}
                        </span>
                      </div>
                    )}
                    {!isEditing && task.description && (
                      <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    {isEditing && (
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Enter task description"
                        rows="2"
                      />
                    )}
                  </td>

                  {/* Assigned To */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <select
                        value={formData.assignedTo}
                        onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                        className="w-full px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select a team member</option>
                        {team.members.map((member) => (
                          <option key={member._id} value={member._id}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm text-gray-900 dark:text-white font-medium">
                        {task.assignedTo?.name || 'Unassigned'}
                      </span>
                    )}
                  </td>

                  {/* Deadline */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        className="w-full px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    ) : (
                      <span className={`text-sm font-medium ${isOverdue(task) ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                        {safeFormatDate(task.deadline)}
                      </span>
                    )}
                  </td>

                  {/* Priority */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(task.priority)}`}>
                        {task.priority?.toUpperCase() || 'MEDIUM'}
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(task)}
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {(task.status?.replace('_', ' ') || 'unknown').toUpperCase()}
                      </span>
                    </div>
                  </td>

                  {/* Completion */}
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {getCompletionText(task)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdate(task._id)}
                          disabled={savingTask === task._id}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-xs font-medium py-2 px-3 rounded-lg transition-all duration-300 flex items-center gap-1"
                        >
                          {savingTask === task._id ? (
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
                          onClick={() => setEditingTask(null)}
                          disabled={savingTask === task._id}
                          className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 disabled:bg-gray-200 disabled:dark:bg-gray-700 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200 text-xs font-medium py-2 px-3 rounded-lg transition-all duration-300 flex items-center gap-1"
                        >
                          <CancelIcon className="h-4 w-4" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {task.submission && (
                          <button
                            onClick={() => onViewSubmission && onViewSubmission(task)}
                            className="p-2 text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-900/50 rounded-lg transition-all duration-300"
                            title="View Submission"
                          >
                            <VisibilityIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(task)}
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-lg transition-all duration-300"
                          title="Edit Task"
                        >
                          <EditIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(task)}
                          className="p-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-lg transition-all duration-300"
                          title="Delete Task"
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

      {/* Delete Confirmation Modal */}
      {taskToDelete && (
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
                    Delete Task
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              <button
                onClick={cancelDelete}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                disabled={deletingTask}
              >
                <CloseIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Are you sure you want to delete the task <strong>"{taskToDelete.title}"</strong>?
              </p>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-2">
                  <WarningIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                      Warning: This action is permanent
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                      All task data, including any submissions and files, will be permanently removed from the system.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={cancelDelete}
                disabled={deletingTask}
                className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 disabled:bg-gray-200 disabled:dark:bg-gray-700 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200 font-medium py-2 px-6 rounded-lg transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(taskToDelete._id)}
                disabled={deletingTask}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-lg transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                {deletingTask ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <DeleteIcon className="h-5 w-5" />
                    <span>Delete Task</span>
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

export default TaskManagement;