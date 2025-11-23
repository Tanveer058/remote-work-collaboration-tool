import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContex';

const RootRedirect = () => {
  const { user } = useAuth();
  
  if (user) {
    // Redirect logged-in users to their dashboard
    switch (user.role) {
      case 'manager':
        return <Navigate to="/manager/dashboard" replace />;
      case 'teamlead':
        return <Navigate to="/teamlead/dashboard" replace />;
      case 'member':
        return <Navigate to="/member/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  } else {
    // Redirect non-logged-in users to login
    return <Navigate to="/login" replace />;
  }
};

export default RootRedirect;