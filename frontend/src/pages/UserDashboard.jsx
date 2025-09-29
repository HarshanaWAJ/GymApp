import React, { useEffect, useState } from 'react';
import UserStoreDashboard from '../components/StoreUserSidebar';
import axiosInstance from '../api/axiosInstance';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CartModal from './forms/CartModal';
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Chip,
  Badge,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Container,
  Skeleton,
  Rating,
  Tooltip,
  Fab,
  useMediaQuery,
  useTheme,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Switch,
  Divider,
  Autocomplete
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ViewListIcon from '@mui/icons-material/ViewList';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RecommendIcon from '@mui/icons-material/Recommend';

function UserDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const sidebarWidth = 240;
  
  const dashboardContentStyle = {
    marginLeft: !isMobile ? `${sidebarWidth}px` : '0',
    transition: 'margin-left 0.3s ease',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
  };

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [favorites, setFavorites] = useState(new Set());
  const [cartItemCount, setCartItemCount] = useState(0);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [userPreferences, setUserPreferences] = useState({
    categories: [],
    keywords: [],
    priceRange: { min: 0, max: 1000 },
    brands: [],
    enableRecommendations: true
  });
  const [showRecommendations, setShowRecommendations] = useState(true);

  // Predefined preference options
  const availableKeywords = [
    'organic', 'premium', 'eco-friendly', 'wireless', 'smart', 'portable',
    'durable', 'lightweight', 'waterproof', 'vintage', 'modern', 'luxury',
    'budget-friendly', 'professional', 'gaming', 'fitness', 'outdoor',
    'indoor', 'kitchen', 'electronic', 'handmade', 'imported', 'local'
  ];

  useEffect(() => {
    fetchAllProducts();
    loadFavorites();
    loadUserPreferences();
    updateCartCount();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
    generateRecommendations();
  }, [products, searchTerm, categoryFilter, sortBy, userPreferences]);

  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/products/');
      const productsWithRatings = response.data.map(product => ({
        ...product,
        rating: Math.random() * 2 + 3, // Mock rating between 3-5
        reviewCount: Math.floor(Math.random() * 100) + 10,
        // Mock description if not available
        description: product.description || `High-quality ${product.name.toLowerCase()} perfect for your needs. Features excellent build quality and great value for money.`,
      }));
      
      setProducts(productsWithRatings);

      const initialQuantities = {};
      productsWithRatings.forEach(product => {
        initialQuantities[product._id] = 1;
      });
      setQuantities(initialQuantities);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products.');
    } finally {
      setLoading(false);
    }
  };

  const loadUserPreferences = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.id) {
      const prefKey = `preferences_${user.id}`;
      const savedPreferences = JSON.parse(localStorage.getItem(prefKey));
      if (savedPreferences) {
        setUserPreferences(savedPreferences);
      }
    }
  };

  const saveUserPreferences = (preferences) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.id) {
      const prefKey = `preferences_${user.id}`;
      localStorage.setItem(prefKey, JSON.stringify(preferences));
      setUserPreferences(preferences);
      toast.success('Preferences saved successfully!');
    }
  };

  const calculateRelevanceScore = (product) => {
    let score = 0;
    const { categories, keywords, brands, priceRange } = userPreferences;

    // Category preference
    if (categories.includes(product.category)) {
      score += 30;
    }

    // Brand preference
    if (brands.includes(product.brand)) {
      score += 20;
    }

    // Price range preference
    if (product.price >= priceRange.min && product.price <= priceRange.max) {
      score += 15;
    }

    // Keyword matching in name and description
    const productText = `${product.name} ${product.description} ${product.category}`.toLowerCase();
    keywords.forEach(keyword => {
      if (productText.includes(keyword.toLowerCase())) {
        score += 10;
      }
    });

    // Bonus for favorites
    if (favorites.has(product._id)) {
      score += 25;
    }

    return score;
  };

  const generateRecommendations = () => {
    if (!userPreferences.enableRecommendations) {
      setRecommendedProducts([]);
      return;
    }

    const scoredProducts = products.map(product => ({
      ...product,
      relevanceScore: calculateRelevanceScore(product)
    }));

    const recommended = scoredProducts
      .filter(product => product.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 8);

    setRecommendedProducts(recommended);
  };

  const filterAndSortProducts = () => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'relevance':
          const scoreA = calculateRelevanceScore(a);
          const scoreB = calculateRelevanceScore(b);
          if (scoreA !== scoreB) return scoreB - scoreA;
          return a.name.localeCompare(b.name);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  };

  const loadFavorites = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.id) {
      const favKey = `favorites_${user.id}`;
      const savedFavorites = JSON.parse(localStorage.getItem(favKey)) || [];
      setFavorites(new Set(savedFavorites));
    }
  };

  const updateCartCount = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.id) {
      const cartKey = `cart_${user.id}`;
      const cart = JSON.parse(localStorage.getItem(cartKey)) || { items: [] };
      const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      setCartItemCount(totalItems);
    }
  };

  const handleQuantityChange = (productId, delta) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + delta)
    }));
  };

  const toggleFavorite = (productId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.id) {
      toast.error('Please log in to save favorites.');
      return;
    }

    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
      toast.info('Removed from favorites');
    } else {
      newFavorites.add(productId);
      toast.success('Added to favorites');
    }
    
    setFavorites(newFavorites);
    const favKey = `favorites_${user.id}`;
    localStorage.setItem(favKey, JSON.stringify([...newFavorites]));
  };

  const handleAddToCart = (product) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id;

    if (!userId) {
      toast.error('Please log in to add items to cart.');
      return;
    }

    const quantityToAdd = quantities[product._id] || 1;
    const cartKey = `cart_${userId}`;
    const existingCart = JSON.parse(localStorage.getItem(cartKey)) || {
      user: userId,
      status: 'draft',
      items: [],
      value: 0
    };

    const itemIndex = existingCart.items.findIndex(item => item.product === product._id);
    const existingQuantityInCart = itemIndex > -1 ? existingCart.items[itemIndex].quantity : 0;
    const totalRequestedQuantity = existingQuantityInCart + quantityToAdd;

    if (totalRequestedQuantity > product.qty) {
      toast.error(`Only ${product.qty} "${product.name}" available. You already have ${existingQuantityInCart} in cart.`);
      return;
    }

    if (itemIndex > -1) {
      existingCart.items[itemIndex].quantity += quantityToAdd;
    } else {
      existingCart.items.push({
        product: product._id,
        quantity: quantityToAdd
      });
    }

    localStorage.setItem(cartKey, JSON.stringify(existingCart));
    toast.success(`Added ${quantityToAdd} of "${product.name}" to cart.`);
    updateCartCount();
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(products.map(product => product.category))];
    return categories.filter(Boolean);
  };

  const getUniqueBrands = () => {
    const brands = [...new Set(products.map(product => product.brand))];
    return brands.filter(Boolean);
  };

  const LoadingSkeleton = () => (
    <Grid container spacing={3}>
      {[...Array(8)].map((_, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
          <Card sx={{ maxWidth: 320 }}>
            <Skeleton variant="rectangular" height={200} />
            <CardContent>
              <Skeleton variant="text" sx={{ fontSize: '1.5rem' }} />
              <Skeleton variant="text" />
              <Skeleton variant="text" width="60%" />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const ProductCard = ({ product, isRecommended = false }) => (
    <Card 
      sx={{ 
        maxWidth: 320, 
        margin: 'auto',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8]
        },
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: isRecommended ? '2px solid' : '1px solid',
        borderColor: isRecommended ? theme.palette.primary.main : 'divider'
      }}
    >
      {/* Recommendation Badge */}
      {isRecommended && (
        <Chip
          icon={<RecommendIcon />}
          label="Recommended for You"
          color="primary"
          size="small"
          sx={{ 
            position: 'absolute', 
            top: 8, 
            left: 8, 
            zIndex: 2,
            fontWeight: 'bold',
            backgroundColor: theme.palette.primary.main,
            color: 'white'
          }}
        />
      )}
      
      {/* Stock Status Badge */}
      <Chip
        label={product.qty > 10 ? 'In Stock' : product.qty > 0 ? 'Low Stock' : 'Out of Stock'}
        color={product.qty > 10 ? 'success' : product.qty > 0 ? 'warning' : 'error'}
        size="small"
        sx={{ 
          position: 'absolute', 
          top: isRecommended ? 40 : 8, 
          left: 8, 
          zIndex: 1,
          fontWeight: 'bold'
        }}
      />
      
      {/* Favorite Button */}
      <IconButton
        onClick={() => toggleFavorite(product._id)}
        sx={{ 
          position: 'absolute', 
          top: 8, 
          right: 8, 
          zIndex: 1,
          backgroundColor: 'rgba(255,255,255,0.9)',
          '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
        }}
      >
        {favorites.has(product._id) ? 
          <FavoriteIcon color="error" /> : 
          <FavoriteBorderIcon />
        }
      </IconButton>

      <CardMedia
        component="img"
        height="200"
        image={product.img_src || 'https://placehold.co/250x200'}
        alt={product.name}
        sx={{
          objectFit: 'cover',
          transition: 'transform 0.3s ease',
          '&:hover': { transform: 'scale(1.05)' }
        }}
      />
      
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {product.name}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {product.description}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating 
            value={product.rating} 
            precision={0.1} 
            readOnly 
            size="small"
            sx={{ mr: 1 }}
          />
          <Typography variant="body2" color="text.secondary">
            ({product.reviewCount})
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
          <Chip
            icon={<LocalOfferIcon />}
            label={product.category}
            variant="outlined"
            size="small"
          />
          <Chip
            label={product.brand}
            variant="outlined"
            size="small"
            color="secondary"
          />
        </Box>
        
        <Typography 
          variant="h5" 
          color="primary" 
          sx={{ fontWeight: 700, mb: 1 }}
        >
          ${product.price}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          <strong>Available:</strong> {product.qty} units
        </Typography>
      </CardContent>
      
      <CardActions sx={{ 
        justifyContent: 'space-between', 
        padding: '8px 16px 16px',
        borderTop: '1px solid',
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton 
            onClick={() => handleQuantityChange(product._id, -1)}
            size="small"
            disabled={quantities[product._id] <= 1}
          >
            <RemoveIcon />
          </IconButton>
          <Typography 
            component="span" 
            sx={{ 
              minWidth: '24px', 
              textAlign: 'center',
              fontWeight: 600
            }}
          >
            {quantities[product._id] || 1}
          </Typography>
          <IconButton 
            onClick={() => handleQuantityChange(product._id, 1)}
            size="small"
          >
            <AddIcon />
          </IconButton>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<ShoppingCartIcon />}
          onClick={() => handleAddToCart(product)}
          disabled={product.qty === 0}
          sx={{
            borderRadius: '20px',
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Add to Cart
        </Button>
      </CardActions>
    </Card>
  );

  const PreferencesDialog = () => (
    <Dialog 
      open={preferencesOpen} 
      onClose={() => setPreferencesOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonIcon color="primary" />
        Your Shopping Preferences
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {/* Enable Recommendations */}
          <FormControlLabel
            control={
              <Switch
                checked={userPreferences.enableRecommendations}
                onChange={(e) => setUserPreferences(prev => ({
                  ...prev,
                  enableRecommendations: e.target.checked
                }))}
              />
            }
            label="Enable personalized recommendations"
            sx={{ mb: 3 }}
          />

          <Divider sx={{ my: 2 }} />

          {/* Categories */}
          <Typography variant="h6" gutterBottom>
            Preferred Categories
          </Typography>
          <Autocomplete
            multiple
            options={getUniqueCategories()}
            value={userPreferences.categories}
            onChange={(event, newValue) => {
              setUserPreferences(prev => ({
                ...prev,
                categories: newValue
              }));
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip variant="outlined" label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Select categories you're interested in"
              />
            )}
            sx={{ mb: 3 }}
          />

          {/* Brands */}
          <Typography variant="h6" gutterBottom>
            Preferred Brands
          </Typography>
          <Autocomplete
            multiple
            options={getUniqueBrands()}
            value={userPreferences.brands}
            onChange={(event, newValue) => {
              setUserPreferences(prev => ({
                ...prev,
                brands: newValue
              }));
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip variant="outlined" label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Select preferred brands"
              />
            )}
            sx={{ mb: 3 }}
          />

          {/* Keywords */}
          <Typography variant="h6" gutterBottom>
            Interest Keywords
          </Typography>
          <Autocomplete
            multiple
            freeSolo
            options={availableKeywords}
            value={userPreferences.keywords}
            onChange={(event, newValue) => {
              setUserPreferences(prev => ({
                ...prev,
                keywords: newValue
              }));
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip variant="outlined" label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Add keywords that interest you (e.g., premium, wireless, eco-friendly)"
              />
            )}
            sx={{ mb: 3 }}
          />

          {/* Price Range */}
          <Typography variant="h6" gutterBottom>
            Price Range
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="Min Price"
              type="number"
              value={userPreferences.priceRange.min}
              onChange={(e) => setUserPreferences(prev => ({
                ...prev,
                priceRange: { ...prev.priceRange, min: Number(e.target.value) }
              }))}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
            <TextField
              label="Max Price"
              type="number"
              value={userPreferences.priceRange.max}
              onChange={(e) => setUserPreferences(prev => ({
                ...prev,
                priceRange: { ...prev.priceRange, max: Number(e.target.value) }
              }))}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setPreferencesOpen(false)}>
          Cancel
        </Button>
        <Button 
          onClick={() => {
            saveUserPreferences(userPreferences);
            setPreferencesOpen(false);
          }}
          variant="contained"
        >
          Save Preferences
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <div className="bootstrap-scope">
      <Box sx={{margin: '50px'}}>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {/* Header Section */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              mb: 3, 
              background: 'linear-gradient(135deg, #f35b89ff 0%, #b82d2dff 100%)',
              color: 'white',
              borderRadius: 2
            }}
          >
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
              Our Products
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Discover amazing products tailored to your preferences
            </Typography>
          </Paper>

          {/* Controls Section */}
          <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  placeholder="Search products..."
                  variant="outlined"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={categoryFilter}
                    label="Category"
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    {getUniqueCategories().map(category => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sort By"
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <MenuItem value="relevance">Relevance</MenuItem>
                    <MenuItem value="name">Name</MenuItem>
                    <MenuItem value="price-low">Price: Low to High</MenuItem>
                    <MenuItem value="price-high">Price: High to Low</MenuItem>
                    <MenuItem value="rating">Rating</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  onClick={() => setPreferencesOpen(true)}
                  sx={{ 
                    height: '56px',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '12px'
                  }}
                >
                  Preferences
                </Button>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => setCartOpen(true)}
                  sx={{ 
                    height: '56px',
                    background: 'linear-gradient(45deg, #FF6B6B, #FF8E53)',
                    color: 'white',
                    fontWeight: 600,
                    borderRadius: '12px',
                    textTransform: 'none',
                    boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #FF5252, #FF7043)',
                      boxShadow: '0 6px 20px rgba(255, 107, 107, 0.4)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                  startIcon={
                    <Badge 
                      badgeContent={cartItemCount} 
                      color="warning"
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: '#FFF',
                          color: '#FF6B6B',
                          fontWeight: 'bold',
                          fontSize: '0.7rem',
                          minWidth: '18px',
                          height: '18px'
                        }
                      }}
                    >
                      <ShoppingCartIcon />
                    </Badge>
                  }
                >
                  My Cart
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Recommendations Section */}
          {userPreferences.enableRecommendations && recommendedProducts.length > 0 && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon color="primary" />
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Recommended for You
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showRecommendations}
                      onChange={(e) => setShowRecommendations(e.target.checked)}
                    />
                  }
                  label="Show"
                />
              </Box>

              {showRecommendations && (
                <Box sx={{ mb: 4 }}>
                  <Grid container spacing={3}>
                    {recommendedProducts.slice(0, 4).map(product => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={`rec-${product._id}`}>
                        <ProductCard product={product} isRecommended={true} />
                      </Grid>
                    ))}
                  </Grid>
                  <Divider sx={{ mt: 3, mb: 2 }} />
                </Box>
              )}
            </>
          )}

          {/* Products Section */}
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            {filteredProducts.length} Product{filteredProducts.length !== 1 ? 's' : ''} Found
          </Typography>

          {loading ? (
            <LoadingSkeleton />
          ) : filteredProducts.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No products found matching your criteria
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                }}
                sx={{ mt: 2 }}
              >
                Clear Filters
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {filteredProducts.map(product => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                  <ProductCard product={product} />
                </Grid>
              ))}
            </Grid>
          )}
        </Container>

        {/* Professional Cart Header */}
        {isMobile && (
          <Paper
            elevation={3}
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1100,
              p: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderBottom: '1px solid rgba(0,0,0,0.1)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Professional Store
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  onClick={() => setPreferencesOpen(true)}
                  sx={{
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.2)' }
                  }}
                >
                  <SettingsIcon color="primary" />
                </IconButton>
                <Button
                  variant="contained"
                  onClick={() => setCartOpen(true)}
                  sx={{
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    borderRadius: '20px',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5a6fd8, #6a42a0)',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                    }
                  }}
                  startIcon={
                    <Badge 
                      badgeContent={cartItemCount} 
                      color="error"
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: '#FF4444',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.7rem',
                          minWidth: '18px',
                          height: '18px',
                          animation: cartItemCount > 0 ? 'pulse 2s infinite' : 'none',
                          '@keyframes pulse': {
                            '0%': { transform: 'scale(1)' },
                            '50%': { transform: 'scale(1.1)' },
                            '100%': { transform: 'scale(1)' }
                          }
                        }
                      }}
                    >
                      <ShoppingCartIcon />
                    </Badge>
                  }
                >
                  Cart
                </Button>
              </Box>
            </Box>
          </Paper>
        )}

        {/* Floating Cart Button for Mobile */}
        {!isMobile && (
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1000,
              width: 64,
              height: 64,
              background: 'linear-gradient(45deg, #FF6B6B, #FF8E53)',
              boxShadow: '0 8px 25px rgba(255, 107, 107, 0.4)',
              '&:hover': {
                background: 'linear-gradient(45deg, #FF5252, #FF7043)',
                boxShadow: '0 12px 35px rgba(255, 107, 107, 0.5)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
            onClick={() => setCartOpen(true)}
          >
            <Badge 
              badgeContent={cartItemCount} 
              color="warning"
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: '#FFF',
                  color: '#FF6B6B',
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  minWidth: '22px',
                  height: '22px',
                  border: '2px solid #FF6B6B',
                  animation: cartItemCount > 0 ? 'bounce 1s ease-in-out infinite alternate' : 'none',
                  '@keyframes bounce': {
                    '0%': { transform: 'translateY(0px)' },
                    '100%': { transform: 'translateY(-3px)' }
                  }
                }
              }}
            >
              <ShoppingCartIcon sx={{ fontSize: 28 }} />
            </Badge>
          </Fab>
        )}

        {/* Preferences Floating Button for Desktop */}
        {!isMobile && (
          <Fab
            color="secondary"
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 96,
              zIndex: 1000,
              width: 56,
              height: 56,
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a6fd8, #6a42a0)',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.5)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
            onClick={() => setPreferencesOpen(true)}
          >
            <SettingsIcon sx={{ fontSize: 24, color: 'white' }} />
          </Fab>
        )}
      </Box>

      <PreferencesDialog />

      <CartModal
        open={cartOpen}
        handleClose={() => {
          setCartOpen(false);
          updateCartCount();
        }}
        products={products.map(p => ({ ...p, image: p.img_src }))}
      />
      
      <ToastContainer 
        position="bottom-right"
        theme="light"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default UserDashboard;