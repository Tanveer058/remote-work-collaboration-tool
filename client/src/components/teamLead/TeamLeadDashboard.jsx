import { useState, useEffect, useMemo } from 'react';
import Navbar from '../common/Navbar';
import TaskManagement from './TaskManagement';
import CreateTaskModal from './CreateTaskModal';
import ViewSubmittedTaskModal from './ViewSumittedTaskModal';
import { getMyTeam } from '../../services/teamService';
import { getTeamTasks } from '../../services/taskService';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';

const TeamLeadDashboard = () => {
  const [team, setTeam] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    title: '',
    assignedTo: '',
    priority: '',
    status: '',
    completion: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Safe date creation helper
  const safeCreateDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  };

  // Helper function to get completion text (copied from TaskManagement)
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [teamData, tasksData] = await Promise.all([
        getMyTeam(),
        getTeamTasks()
      ]);
      setTeam(teamData);
      setTasks(tasksData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubmission = (task) => {
    setSelectedSubmission(task);
    setShowSubmissionModal(true);
  };

  // Filter tasks based on search and filters
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          (task.title?.toLowerCase().includes(query)) ||
          (task.description?.toLowerCase().includes(query)) ||
          (task.assignedTo?.name?.toLowerCase().includes(query)) ||
          (task.priority?.toLowerCase().includes(query)) ||
          (task.status?.toLowerCase().includes(query)) ||
          (getCompletionText(task)?.toLowerCase().includes(query));
        
        if (!matchesSearch) return false;
      }

      // Individual filters
      if (filters.title && !task.title?.toLowerCase().includes(filters.title.toLowerCase())) {
        return false;
      }
      
      if (filters.assignedTo && task.assignedTo?._id !== filters.assignedTo) {
        return false;
      }
      
      if (filters.priority && task.priority !== filters.priority) {
        return false;
      }
      
      if (filters.status && task.status !== filters.status) {
        return false;
      }
      
      if (filters.completion) {
        const completionText = getCompletionText(task);
        if (completionText !== filters.completion) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, searchQuery, filters]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      title: '',
      assignedTo: '',
      priority: '',
      status: '',
      completion: ''
    });
  };

  // Check if any filter is active
  const hasActiveFilters = searchQuery || 
    Object.values(filters).some(value => value !== '');

  const stats = {
    totalMembers: team?.members?.length || 0,
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    overdueTasks: tasks.filter(t => {
      return t.status !== 'completed' && new Date(t.deadline) < new Date();
    }).length,
    submittedTasks: tasks.filter(t => t.submission).length
  };

  // Get tasks with submissions for quick access
  const submittedTasks = tasks.filter(task => task.submission);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-4">
                Loading dashboard...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <ErrorOutlineIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No Team Assigned
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
              You haven't been assigned to a team yet. Please contact your manager to be assigned to a team.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 Once assigned, you'll be able to manage your team and create tasks here.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Team Lead Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your team and assign tasks effectively
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Team Members Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Team Members
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.totalMembers}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Active members
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <GroupIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* Total Tasks Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Tasks
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.totalTasks}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  All tasks
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <AssignmentIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          {/* Completed Tasks Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Completed
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.completedTasks}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Finished tasks
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          {/* Overdue Tasks Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Overdue
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.overdueTasks}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Need attention
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                <ErrorOutlineIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          {/* Submitted Tasks Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Submitted
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.submittedTasks}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Awaiting review
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                <VisibilityIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Team Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <GroupIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {team.name}
                </h2>
                {team.description && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {team.description}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Team Members ({team.members.length})
              </h3>
              {team.members.map((member, index) => (
                <div key={member._id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {member.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {member.email}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Submissions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 lg:col-span-1">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <VisibilityIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Recent Submissions
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Latest task submissions from your team
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {submittedTasks.length > 0 ? (
                submittedTasks.slice(0, 5).map((task) => (
                  <div 
                    key={task._id} 
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-600 transition-colors duration-200 cursor-pointer"
                    onClick={() => handleViewSubmission(task)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {task.title}
                      </h3>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                        Submitted
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>By: {task.assignedTo?.name}</span>
                      <span>{new Date(task.submission.submittedAt).toLocaleDateString()}</span>
                    </div>
                    {task.submission.files && task.submission.files.length > 0 && (
                      <div className="mt-2 flex items-center text-xs text-blue-600 dark:text-blue-400">
                        <span>📎 {task.submission.files.length} file(s)</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <VisibilityIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No submissions yet. Tasks will appear here when team members submit their work.
                  </p>
                </div>
              )}
            </div>

            {submittedTasks.length > 5 && (
              <div className="mt-4 text-center">
                <button 
                  onClick={() => setShowSubmissionModal(true)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                >
                  View all {submittedTasks.length} submissions
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Task Management */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Task Management
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Create and track tasks for your team members
              </p>
            </div>
            
            {/* Search and Filter Section */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[200px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <ClearIcon className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  </button>
                )}
              </div>

              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                  showFilters || hasActiveFilters
                    ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <FilterListIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Filters</span>
                {hasActiveFilters && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
                    !
                  </span>
                )}
              </button>

              {/* Create Task Button */}
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl whitespace-nowrap"
              >
                <AddIcon className="h-5 w-5" />
                <span>Create Task</span>
              </button>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Filter Tasks
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
                  >
                    <ClearIcon className="h-4 w-4" />
                    Clear all
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Title Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={filters.title}
                    onChange={(e) => setFilters({ ...filters, title: e.target.value })}
                    placeholder="Filter by title..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Assigned To Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Assigned To
                  </label>
                  <select
                    value={filters.assignedTo}
                    onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Members</option>
                    {team.members.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Status</option>
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {/* Completion Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Completion
                  </label>
                  <select
                    value={filters.completion}
                    onChange={(e) => setFilters({ ...filters, completion: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Completion</option>
                    <option value="Completed On Time">Completed On Time</option>
                    <option value="Submitted After Deadline">Submitted After Deadline</option>
                    <option value="Deadline Passed">Deadline Passed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Not Started">Not Started</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredTasks.length} of {tasks.length} tasks
              {hasActiveFilters && ' (filtered)'}
            </p>
          </div>

          {/* Render TaskManagement with filtered tasks */}
          <TaskManagement
            tasks={filteredTasks}
            team={team}
            onTaskUpdate={loadData}
            onViewSubmission={handleViewSubmission}
            viewMode="table"
          />
        </div>
      </div>

      {showModal && (
        <CreateTaskModal
          team={team}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            loadData();
          }}
        />
      )}

      {showSubmissionModal && (
        <ViewSubmittedTaskModal
          tasks={submittedTasks}
          onClose={() => {
            setShowSubmissionModal(false);
            setSelectedSubmission(null);
          }}
          initialTask={selectedSubmission}
        />
      )}
    </div>
  );
};

export default TeamLeadDashboard;