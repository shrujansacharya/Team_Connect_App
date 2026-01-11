import { Navigate } from 'react-router-dom';
import { getToken, getUser } from '../utils/auth';

export const ProtectedRoute = ({ children }) => {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin' && !user.is_approved) {
    return <Navigate to="/pending" replace />;
  }

  return children;
};

export const AdminRoute = ({ children }) => {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/home" replace />;
  }

  return children;
};