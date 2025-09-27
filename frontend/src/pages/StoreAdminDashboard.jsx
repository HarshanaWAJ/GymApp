import React, { useEffect, useState } from 'react';
import StoreAdminSidebar from '../components/StoreAdminSidebar';
import axiosInstant from '../api/axiosInstance';

// Material UI Components
import { Card, CardContent, Typography } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CategoryIcon from '@mui/icons-material/Category';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import DescriptionIcon from '@mui/icons-material/Description';


function StoreAdminDashboard() {
  const sidebarWidth = 200;
  const [userCount, setUserCount] = useState(null);
  const [productCount, setProductCount] = useState(null);
  const [productCategoryCount, setProductCategoryCount] = useState(null);
  const [sellsCount, setSellsCount] = useState(null);
  const [draftCount, setDraftCount] = useState(null);

  const dashboardContentStyle = {
    padding: '20px',
    marginLeft: window.innerWidth >= 768 ? `${sidebarWidth}px` : '0',
    transition: 'margin-left 0.3s',
  };

  useEffect(() => {

    // Get User Count
    const fetchUserCount = async () => {
      try {
        const response = await axiosInstant.get('/auth/get-user-count');
        setUserCount(response.data.userCount);
      } catch (error) {
        console.error('Failed to fetch user count:', error);
      }
    };

    // Get Product Count
    const fetchProductCount = async () => {
        try {
            const response = await axiosInstant.get('/products/get-product-count')
            setProductCount(response.data.allProductCount);
            
        } catch (error) {
            console.error('Failed to fetch user count:', error);
        }
    }

    // Get Products By Categories
    const fetchProductsCountByCategory = async () => {
        try {
            const response = await axiosInstant.get('/products/get-product-count-by-category')
            setProductCategoryCount(response.data.counts.length)
        } catch (error) {
            console.error('Failed to fetch product count by catergory:', error);
        }
    }

    // Get Sells Count
    const fetchSellsCount = async () => {
        try {
            const response = await axiosInstant.get('/payment/get-sells-count')
            setSellsCount(response.data.sellsCount);
        } catch (error) {
            console.error('Failed to fetch sells count', error);
        }
    }

    // Get Draft Count
    const fetchDraftCount = async () => {
        try {
            const response = await axiosInstant.get('/cart/get-draft-count')
            setDraftCount(response.data);
        } catch (error) {
            console.error('Failed to fetch draft count', error);
        }
    }

    fetchDraftCount();
    fetchSellsCount();
    fetchProductsCountByCategory();
    fetchUserCount();
    fetchProductCount();
  }, []);

  return (
    <div class="bootstrap-scope">
      <StoreAdminSidebar />
      <div style={dashboardContentStyle}>
        <Typography variant="h4" gutterBottom>
          Store Admin Dashboard
        </Typography>

        <div
            style={{
                marginTop: '2rem',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '20px',  // space between cards
                justifyContent: 'space-between',
            }}
        >
            {/* User Count Card */}
            <Card
            sx={{
                width: 250,
                display: 'flex',
                alignItems: 'center',
                padding: 3,
                mb: 3,
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                cursor: 'default',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                boxShadow: '0 8px 20px rgba(25, 118, 210, 0.4)',
                transform: 'translateY(-4px)',
                },
            }}
            >
            <GroupIcon sx={{ fontSize: 48, color: '#1976d2', mr: 3 }} />
            <CardContent sx={{ padding: 0 }}>
                <Typography
                variant="subtitle1"
                color="textSecondary"
                sx={{ fontWeight: '500', mb: 0.5 }}
                >
                Users
                </Typography>
                <Typography
                variant="h4"
                sx={{ fontWeight: '700', color: '#0d47a1', letterSpacing: '0.05em' }}
                >
                {userCount !== null ? userCount : 'Loading...'}
                </Typography>
            </CardContent>
            </Card>

            {/* Product Count Card */}
            <Card
            sx={{
                width: 250,
                display: 'flex',
                alignItems: 'center',
                padding: 3,
                mb: 3,
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                cursor: 'default',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                boxShadow: '0 8px 20px rgba(25, 118, 210, 0.4)',
                transform: 'translateY(-4px)',
                },
            }}
            >
            <Inventory2Icon sx={{ fontSize: 48, color: '#1976d2', mr: 3 }} />
            <CardContent sx={{ padding: 0 }}>
                <Typography
                variant="subtitle1"
                color="textSecondary"
                sx={{ fontWeight: '500', mb: 0.5 }}
                >
                Products
                </Typography>
                <Typography
                variant="h4"
                sx={{ fontWeight: '700', color: '#0d47a1', letterSpacing: '0.05em' }}
                >
                {productCount !== null ? productCount : 'Loading...'}
                </Typography>
            </CardContent>
            </Card>

            {/* Category Count Card */}
            <Card
            sx={{
                width: 250,
                display: 'flex',
                alignItems: 'center',
                padding: 3,
                mb: 3,
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                cursor: 'default',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                boxShadow: '0 8px 20px rgba(25, 118, 210, 0.4)',
                transform: 'translateY(-4px)',
                },
            }}
            >
            <CategoryIcon sx={{ fontSize: 48, color: '#1976d2', mr: 3 }} />
            <CardContent sx={{ padding: 0 }}>
                <Typography
                variant="subtitle1"
                color="textSecondary"
                sx={{ fontWeight: '500', mb: 0.5 }}
                >
                Categories
                </Typography>
                <Typography
                variant="h4"
                sx={{ fontWeight: '700', color: '#0d47a1', letterSpacing: '0.05em' }}
                >
                {userCount !== null ? productCategoryCount : 'Loading...'}
                </Typography>
            </CardContent>
            </Card>

            {/* Sells Count Card */}
            <Card
            sx={{
                width: 250,
                display: 'flex',
                alignItems: 'center',
                padding: 3,
                mb: 3,
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                cursor: 'default',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                boxShadow: '0 8px 20px rgba(25, 118, 210, 0.4)',
                transform: 'translateY(-4px)',
                },
            }}
            >
            <MonetizationOnIcon sx={{ fontSize: 48, color: '#1976d2', mr: 3 }} />
            <CardContent sx={{ padding: 0 }}>
                <Typography
                variant="subtitle1"
                color="textSecondary"
                sx={{ fontWeight: '500', mb: 0.5 }}
                >
                Sales
                </Typography>
                <Typography
                variant="h4"
                sx={{ fontWeight: '700', color: '#0d47a1', letterSpacing: '0.05em' }}
                >
                {sellsCount !== null ? sellsCount : 'Loading...'}
                </Typography>
            </CardContent>
            </Card>

            {/* Draft Count Card */}
            <Card
            sx={{
                width: 250,
                display: 'flex',
                alignItems: 'center',
                padding: 3,
                mb: 3,
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                cursor: 'default',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                boxShadow: '0 8px 20px rgba(25, 118, 210, 0.4)',
                transform: 'translateY(-4px)',
                },
            }}
            >
            <DescriptionIcon sx={{ fontSize: 48, color: '#1976d2', mr: 3 }} />
            <CardContent sx={{ padding: 0 }}>
                <Typography
                variant="subtitle1"
                color="textSecondary"
                sx={{ fontWeight: '500', mb: 0.5 }}
                >
                Draft Orders
                </Typography>
                <Typography
                variant="h4"
                sx={{ fontWeight: '700', color: '#0d47a1', letterSpacing: '0.05em' }}
                >
                {draftCount !== null ? draftCount : 'Loading...'}
                </Typography>
            </CardContent>
            </Card>
            
          </div>
      </div>
    </div>
  );
}

export default StoreAdminDashboard;
