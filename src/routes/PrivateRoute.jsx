import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = () => {
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);

  return isLoggedIn ? <Outlet /> : <Navigate to="/expense-tracker/login" />;
};

export default PrivateRoute;
