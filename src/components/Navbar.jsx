import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">XP-Tracker</div>
      <ul className="navbar-links">
        <li>
          <NavLink to="/xt" className={({ isActive }) => isActive ? 'active' : ''}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/xt/profile" className={({ isActive }) => isActive ? 'active' : ''}>
            Profile
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
