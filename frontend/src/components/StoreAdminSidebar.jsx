import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as ProductsIcon,
  TrendingUp as SalesIcon,
  FitnessCenter as TrainerIcon,
  Event as AppointmentIcon,
  Reviews as ReviewsIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const COLLAPSED_WIDTH = 72;

const menuItems = [
  {
    title: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/admin-dashboard',
    description: 'Overview & Analytics'
  },
  {
    title: 'Products',
    icon: <ProductsIcon />,
    path: '/admin-product-management',
    description: 'Manage Inventory'
  },
  {
    title: 'Sales',
    icon: <SalesIcon />,
    path: '/admin-sale-summary',
    description: 'Revenue Reports'
  },
  {
    title: 'Trainers',
    icon: <TrainerIcon />,
    path: '/admin-trainer-management',
    description: 'Staff Management'
  },
  {
    title: 'Appointments',
    icon: <AppointmentIcon />,
    path: '/admin-appointment-management',
    description: 'Schedule Management'
  },
  {
    title: 'Reviews',
    icon: <ReviewsIcon />,
    path: '/admin-reviews',
    description: 'Customer Feedback'
  }
];

const EnhancedSidebar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    setUser(parsedUser);
  }, [location]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActivePage = (path) => location.pathname === path;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: COLLAPSED_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: COLLAPSED_WIDTH,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #dc2626 0%, #000000 30%, #000000 100%)',
          color: '#ffffff',
          overflowX: 'hidden',
          border: 'none',
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.3)'
        }
      }}
    >
      <Box sx={{ pt: 2 }}>
        <List>
          {menuItems.map((item) => {
            const isActive = isActivePage(item.path);
            return (
              <ListItem key={item.title} disablePadding sx={{ justifyContent: 'center' }}>
                <Tooltip title={`${item.title} - ${item.description}`} placement="right" arrow>
                  <ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      borderRadius: 2,
                      justifyContent: 'center',
                      mx: 1,
                      my: 0.5,
                      py: 1.5,
                      background: isActive
                        ? 'rgba(220, 38, 38, 0.2)'
                        : 'transparent',
                      border: isActive
                        ? '1px solid rgba(220, 38, 38, 0.5)'
                        : '1px solid transparent',
                      '&:hover': {
                        background: 'rgba(220, 38, 38, 0.15)',
                        transform: 'scale(1.1)'
                      },
                      '&:active': {
                        transform: 'scale(0.95)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive ? '#dc2626' : '#ffffff',
                        minWidth: 0,
                        justifyContent: 'center'
                      }}
                    >
                      {item.badge ? (
                        <Badge
                          badgeContent={item.badge}
                          color={typeof item.badge === 'string' ? 'success' : 'error'}
                          sx={{
                            '& .MuiBadge-badge': {
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              minWidth: 18,
                              height: 18,
                              backgroundColor: '#dc2626',
                              color: '#ffffff'
                            }
                          }}
                        >
                          {item.icon}
                        </Badge>
                      ) : (
                        item.icon
                      )}
                    </ListItemIcon>
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
};

export default EnhancedSidebar;
