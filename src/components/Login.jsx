import { useState } from 'react';
import axios from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../redux/reducers/userSlice';
import './Login.css'; // Import the CSS

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.user);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());

    try {
       await axios.post(
        '/api/auth/login',
        new URLSearchParams({
          username: credentials.username,
          password: credentials.password,
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          withCredentials: true,
        }
      );

      const userDetails = { username: credentials.username };
      dispatch(loginSuccess(userDetails));
      navigate('/expense-tracker');
    } catch (error) {
      dispatch(loginFailure(error.response?.data?.message || 'Login failed'));
      console.log('Login failed', error);
    }
  };

  return (
    <div className="login-wrapper">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>

        <div className="input-group">
          <input
            name="username"
            onChange={handleChange}
            placeholder="Username"
            required
          />
        </div>

        <div className="input-group">
          <input
            name="password"
            type="password"
            onChange={handleChange}
            placeholder="Password"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {error && <p className="error">{error}</p>}

        <p className="signup-text">
          Don’t have an account? <Link to="/register">Create one</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
