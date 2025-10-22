import React from 'react';
import './Profile.css';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/reducers/userSlice';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const Profile = () => {
  const { userDetails, isLoggedIn } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('/api/user/logout', {}, { withCredentials: true });
    } catch (err) {
      console.error('Logout request failed (still logging out locally).', err);
    } finally {
      dispatch(logout());
      navigate('/login');
    }
  };

  if (!isLoggedIn || !userDetails) {
    return (
      <div className="profile-container">
        <p className="error">No profile data found. Please log in again.</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h2>Your Profile</h2>
      <div className="profile-card">
        <p><strong>Username:</strong> {userDetails.username}</p>
        {userDetails.email && (
          <p><strong>Email:</strong> {userDetails.email}</p>
        )}
        <button className="logout-btn" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Profile;
