import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '~/redux/user/userSlice';

export default function ProtectedRoute({ children, requireAdmin = true }) {
  const currentUser = useSelector(selectCurrentUser);
  const location = useLocation();

  // Kiểm tra nếu chưa đăng nhập
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kiểm tra nếu cần quyền admin nhưng user không phải admin
  if (requireAdmin && currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
