import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContex';

const PublicRoute = ({ children }) => {
  const { user } = useAuth();

  if (user) {
    // Role-based redirection
    switch (user.role) {
      case 'manager':
        return <Navigate to="/manager/dashboard" replace />;
      case 'teamlead':
        return <Navigate to="/teamlead/dashboard" replace />;
      case 'member':
        return <Navigate to="/member/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default PublicRoute;
