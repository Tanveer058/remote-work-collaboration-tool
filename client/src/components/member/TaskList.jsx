import { format } from 'date-fns';
import { updateTaskStatus } from '../../services/taskService';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import PauseCircleFilledIcon from '@mui/icons-material/PauseCircleFilled';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WarningIcon from '@mui/icons-material/Warning';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const TaskList = ({ tasks, onTaskSelect, onTaskUpdate }) => {
  // Safe date formatting function
  const safeFormatDate = (dateString, formatString = 'MMM dd, yyyy') => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '—';
      return format(date, formatString);
    } catch (error) {
      console.error('Date formatting error:', error);
      return '—';
    }
  };

  // Safe date creation for comparisons
  const safeCreateDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    } catch (error) {
      return null;
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    if (newStatus === 'completed') {
      const task = tasks.find(t => t._id === taskId);
      onTaskSelect(task);
      return;
    }
    
    try {
      await updateTaskStatus(taskId, newStatus);
      onTaskUpdate();
    } catch (error) {
      alert('Error updating task status: ' + (error.response?.data?.message || error.message));
    }
  };

  const getStatusColor = (task) => {
    const deadline = safeCreateDate(task.deadline);
    
    if (task.status === 'completed') {
      return 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20';
    } else if (deadline && deadline < new Date()) {
      return 'border-red-500 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20';
    } else if (task.status === 'in_progress') {
      return 'border-yellow-500 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20';
    }
    return 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const isOverdue = (task) => {
    const deadline = safeCreateDate(task.deadline);
    return task.status !== 'completed' && deadline && deadline < new Date();
  };

  const getDaysRemaining = (deadline) => {
    const deadlineDate = safeCreateDate(deadline);
    if (!deadlineDate) return 'No deadline';
    
    const days = Math.ceil((deadlineDate - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return '1 day remaining';
    return `${days} days remaining`;
  };

  // Function to determine if a status button should be disabled
  const getButtonDisabledState = (task, buttonStatus) => {
    const currentStatus = task.status || 'not_started';
    
    // If task is completed, disable all buttons
    if (currentStatus === 'completed') {
      return true;
    }
    
    // If task is in progress, disable "not started" button only
    if (currentStatus === 'in_progress') {
      return buttonStatus === 'not_started';
    }
    
    // If task is not started, only enable "in_progress" button
    if (currentStatus === 'not_started') {
      return buttonStatus !== 'in_progress';
    }
    
    return false;
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6">
        <div className="text-center">
          <AssignmentIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No tasks assigned
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            You don't have any tasks assigned yet. Check back later!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {tasks.map((task, index) => (
        <div 
          key={task._id} 
          className={`rounded-xl border-l-4 p-6 shadow-sm transition-all duration-300 hover:shadow-md ${getStatusColor(task)}`}
        >
          {/* Header Section */}
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-start space-x-3">
                  <AssignmentIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {task.title || 'Untitled Task'}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2 sm:mt-0 sm:ml-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {(task.priority || 'medium').toUpperCase()} PRIORITY
                </span>
                {isOverdue(task) && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                    <WarningIcon className="h-3 w-3 mr-1" />
                    OVERDUE
                  </span>
                )}
                {task.status === 'completed' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    COMPLETED
                  </span>
                )}
                {task.status === 'in_progress' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                    <TrendingUpIcon className="h-3 w-3 mr-1" />
                    IN PROGRESS
                  </span>
                )}
              </div>
            </div>
            {task.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-2 pl-8">
                {task.description}
              </p>
            )}
          </div>

          {/* Task Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Assigned By */}
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg flex-shrink-0">
                <AssignmentIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Assigned By
                </p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {task.assignedBy?.name || 'Unknown'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {task.assignedBy?.email || 'No email'}
                </p>
              </div>
            </div>

            {/* Deadline */}
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg flex-shrink-0">
                <CalendarTodayIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Deadline
                </p>
                <p className={`font-medium ${isOverdue(task) ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                  {safeFormatDate(task.deadline)}
                </p>
                <p className={`text-xs ${isOverdue(task) ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {getDaysRemaining(task.deadline)}
                </p>
              </div>
            </div>

            {/* Current Status */}
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg flex-shrink-0 ${
                task.status === 'completed' 
                  ? 'bg-green-100 dark:bg-green-900' 
                  : task.status === 'in_progress'
                  ? 'bg-yellow-100 dark:bg-yellow-900'
                  : 'bg-gray-100 dark:bg-gray-900'
              }`}>
                {task.status === 'completed' ? (
                  <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : task.status === 'in_progress' ? (
                  <TrendingUpIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                ) : (
                  <PauseCircleFilledIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current Status
                </p>
                <p className="text-gray-900 dark:text-white font-medium capitalize">
                  {(task.status || 'not_started').replace('_', ' ')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {task.status === 'not_started' && 'Click button to start'}
                  {task.status === 'in_progress' && 'In progress'}
                  {task.status === 'completed' && 'Task completed'}
                  {!task.status && 'Status unknown'}
                </p>
              </div>
            </div>
          </div>

          {/* Status Update Buttons */}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Update Task Status:
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleStatusChange(task._id, 'not_started')}
                  disabled={getButtonDisabledState(task, 'not_started')}
                  className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    getButtonDisabledState(task, 'not_started')
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-gray-500 hover:bg-gray-600 text-white transform hover:scale-105 shadow-md hover:shadow-lg'
                  }`}
                >
                  <PauseCircleFilledIcon className="h-4 w-4" />
                  <span>Not Started</span>
                </button>

                <button
                  onClick={() => handleStatusChange(task._id, 'in_progress')}
                  disabled={getButtonDisabledState(task, 'in_progress')}
                  className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    getButtonDisabledState(task, 'in_progress')
                      ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-200 cursor-not-allowed'
                      : 'bg-yellow-500 hover:bg-yellow-600 text-white transform hover:scale-105 shadow-md hover:shadow-lg'
                  }`}
                >
                  <PlayCircleFilledIcon className="h-4 w-4" />
                  <span>In Progress</span>
                </button>

                <button
                  onClick={() => handleStatusChange(task._id, 'completed')}
                  disabled={getButtonDisabledState(task, 'completed')}
                  className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    getButtonDisabledState(task, 'completed')
                      ? 'bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-200 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600 text-white transform hover:scale-105 shadow-md hover:shadow-lg'
                  }`}
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>Complete & Submit</span>
                </button>
              </div>
            </div>
          </div>

          {/* Submission Info */}
          {task.submission && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                    Task Successfully Submitted!
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                    {task.submission.description}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-green-600 dark:text-green-400">
                    <span>
                      Submitted: {safeFormatDate(task.submission.submittedAt, 'MMM dd, yyyy HH:mm')}
                    </span>
                    {task.submission.files && task.submission.files.length > 0 && (
                      <span className="mt-1 sm:mt-0 inline-flex items-center">
                        <AttachFileIcon className="h-3 w-3 mr-1" />
                        {task.submission.files.length} file(s) attached
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TaskList;