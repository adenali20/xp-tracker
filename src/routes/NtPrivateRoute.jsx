import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = () => {
  // check Redux first
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);

  // also check session storage
  const jwtToken = window.sessionStorage.getItem("jwtToken");
  const username = window.sessionStorage.getItem("userName");

  // final check
  const authenticated = isLoggedIn || (jwtToken && username);

  return authenticated ? <Outlet /> : <Navigate to="/nt/login" />;
};

export default PrivateRoute;

