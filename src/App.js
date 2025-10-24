import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import Profile from './components/Profile';
import PrivateRoute from './routes/PrivateRoute';
import SignupPage from './components/SignupPage';
import Layout from './components/Layout'; // Import the layout
import SoftwareEngineerProfile from './components/SoftwareEngineerProfile'; // Import the software engineer profile component

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<SignupPage />} />
        <Route path="/" element={<SoftwareEngineerProfile />} />

        {/* Private routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
