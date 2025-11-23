import { useAuth } from '../../context/AuthContex';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return ;
  }

  if (!isAuthenticated) {
    return ;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return ;
  }

  return children;
};

export default ProtectedRoute;
