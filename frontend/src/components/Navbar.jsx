import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import colors from '../theme/colors';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Recheck user whenever the location changes (user may have logged in/out)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    setUser(parsedUser);
    console.log('Current user:', parsedUser?.name);
    console.log('Current email:', parsedUser?.email);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  // Use 'name' property for display
  const displayName = user?.name || 'User';

  return (
    <nav style={navStyle}>
      <Link to="/" style={logoStyle}>
        Gym App Store
      </Link>

      <div style={rightSection}>
        {!user ? (
          <>
            <Link to="/login" style={linkStyle}>Login</Link>
            <Link to="/register" style={linkStyle}>Register</Link>
          </>
        ) : (
          <>
            <div style={userInfoStyle}>
              <div style={avatarStyle}>
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span>{displayName}</span>
            </div>
            <button onClick={handleLogout} style={logoutButtonStyle}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

const navStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem 2rem',
  backgroundColor: colors.primary,
  color: '#fff',
};

const logoStyle = {
  marginLeft: '2rem',
  fontSize: '1.5rem',
  color: '#fff',
  textDecoration: 'none',
  fontWeight: 'bold',
};

const rightSection = {
  display: 'flex',
  gap: '1rem',
  alignItems: 'center',
};

const linkStyle = {
  color: '#fff',
  textDecoration: 'none',
  fontSize: '1rem',
};

const logoutButtonStyle = {
  backgroundColor: 'transparent',
  border: '1px solid #fff',
  color: '#fff',
  padding: '0.4rem 0.8rem',
  borderRadius: '4px',
  cursor: 'pointer',
};

const userInfoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const avatarStyle = {
  backgroundColor: '#fff',
  color: colors.primary,
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
};

export default Navbar;
