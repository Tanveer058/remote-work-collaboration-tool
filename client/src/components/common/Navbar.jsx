import { useAuth } from '../../context/AuthContex';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount'; // Manager
import GroupsIcon from '@mui/icons-material/Groups'; // Team Lead
import EngineeringIcon from '@mui/icons-material/Engineering'; // Member
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'; // Default

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Show success toast with user's name
    toast.success(`Goodbye, ${user?.name || 'User'}! You have been logged out successfully.`, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: isDark ? 'dark' : 'light',
      style: {
        background: isDark ? '#1f2937' : '#ffffff',
        color: isDark ? '#f9fafb' : '#111827',
        borderRadius: '12px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
      },
      progressStyle: {
        background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
      }
    });

    // Add a slight delay for better UX
    setTimeout(() => {
      logout();
      navigate('/login');
    }, 1000);
  };

  const handleThemeToggle = () => {
    toggleTheme();
    toast.info(`Switched to ${isDark ? 'light' : 'dark'} mode`, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: isDark ? 'light' : 'dark',
      style: {
        borderRadius: '8px',
      }
    });
  };

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
      const iconClass = "h-3 w-3"; // Smaller icons for badges
      
      switch (role) {
        case 'manager':
          return <SupervisorAccountIcon className={iconClass} />;
        case 'teamlead':
          return <GroupsIcon className={iconClass} />;
        case 'member':
          return <EngineeringIcon className={iconClass} />;
        default:
          return <BusinessCenterIcon className={iconClass} />;
      }
    };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo/Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center space-x-3">
              <div className="relative">
                <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <span className="text-white font-bold text-sm">RW</span>
                </div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Remote Work
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Collaboration Platform
                </p>
              </div>
            </div>
          </div>

          {/* Right side - User info and controls */}
          <div className="flex items-center space-x-3">
            {/* User info with enhanced card */}
            <div className="flex items-center space-x-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl px-4 py-2 border border-gray-100 dark:border-gray-600/50">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 relative">
                  <div className="h-10 w-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user?.name}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <PersonIcon className="h-5 w-5 text-white" />
                    )}
                  </div>
                  {/* Keep the green active badge on user avatar */}
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></div>
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {user?.name || 'User'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                    {user?.email || 'user@example.com'}
                  </div>
                </div>
              </div>
              
              {/* Enhanced Role badge */}
              {user?.role && (
                <div className="flex flex-col items-center space-y-1">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getRoleBadgeColor(user.role)}`}>
                    <span className="mr-1">{getRoleIcon(user.role)}</span>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Action buttons container - Removed Notifications and Settings */}
            <div className="flex items-center space-x-2">
              {/* Theme toggle with enhanced animation */}
              <button
                onClick={handleThemeToggle}
                className="p-2 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-600 dark:text-gray-300 hover:shadow-lg transition-all duration-300 hover:scale-105 group"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <LightModeIcon className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                ) : (
                  <DarkModeIcon className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                )}
              </button>

              {/* Enhanced Logout button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-red-500/25 group"
              >
                <LogoutIcon className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                <span className="text-sm font-semibold">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom styles for enhanced visual effects */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .sticky {
          animation: fadeInUp 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Navbar;