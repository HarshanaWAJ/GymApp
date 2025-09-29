import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import colors from '../theme/colors';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Recheck user whenever the location changes (user may have logged in/out)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    setUser(parsedUser);
    console.log('Current user:', parsedUser?.name);
  }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown when route changes
  useEffect(() => {
    setIsDropdownOpen(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsDropdownOpen(false);
    navigate('/login');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleMenuItemClick = () => {
    setIsDropdownOpen(false);
  };

  // Use 'name' property for display
  const displayName = user?.name || 'User';

  const menuItems = [
    { label: 'Store', path: '/user-dashboard', icon: '🏪' },
    { label: 'Purchase History', path: '/user-purchase-summary', icon: '📋' },
    { label: 'Appointments', path: '/user-appointments', icon: '📅' },
    { label: 'My Appointments', path: '/user-my-appointments', icon: '📝' },
  ];

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
            <div style={profileContainer} ref={dropdownRef}>
              <div style={userInfoStyle} onClick={toggleDropdown}>
                <div style={avatarStyle}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <span style={nameStyle}>{displayName}</span>
                <span style={dropdownArrowStyle}>
                  {isDropdownOpen ? '▲' : '▼'}
                </span>
              </div>

              {isDropdownOpen && (
                <div style={dropdownMenuStyle}>
                  <div style={dropdownHeaderStyle}>
                    <div style={dropdownAvatarStyle}>
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={dropdownNameStyle}>{displayName}</div>
                      <div style={dropdownEmailStyle}>{user?.email}</div>
                    </div>
                  </div>
                  
                  <div style={dividerStyle}></div>
                  
                  {menuItems.map((item, index) => (
                    <Link
                      key={index}
                      to={item.path}
                      style={dropdownItemStyle}
                      onClick={handleMenuItemClick}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f5f5f5';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                      }}
                    >
                      <span style={iconStyle}>{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                  
                  <div style={dividerStyle}></div>
                  
                  <button
                    onClick={handleLogout}
                    style={dropdownLogoutStyle}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#fee';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span style={iconStyle}>🚪</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
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
  backgroundColor: '#dc2626', // bg-red-600
  color: '#fff',
  position: 'relative',
  zIndex: 1000,
};

const logoStyle = {
  marginLeft: '3rem',
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

const profileContainer = {
  position: 'relative',
};

const userInfoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  cursor: 'pointer',
  padding: '0.5rem',
  borderRadius: '8px',
  transition: 'background-color 0.2s',
};

const nameStyle = {
  fontSize: '1rem',
};

const dropdownArrowStyle = {
  fontSize: '0.8rem',
  marginLeft: '0.25rem',
  transition: 'transform 0.2s',
};

const avatarStyle = {
  backgroundColor: '#000000', // bg-black
  color: '#dc2626', // text-red-600
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  fontSize: '14px',
};

const dropdownMenuStyle = {
  position: 'absolute',
  top: '100%',
  right: 0,
  backgroundColor: '#fff',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  minWidth: '250px',
  zIndex: 1001,
  overflow: 'hidden',
};

const dropdownHeaderStyle = {
  padding: '1rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  backgroundColor: '#000000', // bg-black
};

const dropdownAvatarStyle = {
  backgroundColor: '#dc2626', // bg-red-600
  color: '#ffffff', // text-white
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  fontSize: '16px',
};

const dropdownNameStyle = {
  fontWeight: '600',
  color: '#ffffff', // text-white
  fontSize: '1rem',
};

const dropdownEmailStyle = {
  fontSize: '0.875rem',
  color: '#ffffff', // text-white
  marginTop: '2px',
};

const dividerStyle = {
  height: '1px',
  backgroundColor: '#e0e0e0',
  margin: '0',
};

const dropdownItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.75rem 1rem',
  color: '#333',
  textDecoration: 'none',
  fontSize: '0.9rem',
  transition: 'background-color 0.2s',
  cursor: 'pointer',
  border: 'none',
  width: '100%',
  textAlign: 'left',
  backgroundColor: 'transparent',
};

const dropdownLogoutStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.75rem 1rem',
  color: '#dc3545',
  fontSize: '0.9rem',
  transition: 'background-color 0.2s',
  cursor: 'pointer',
  border: 'none',
  width: '100%',
  textAlign: 'left',
  backgroundColor: 'transparent',
};

const iconStyle = {
  fontSize: '1rem',
  width: '20px',
  textAlign: 'center',
};

export default Navbar;