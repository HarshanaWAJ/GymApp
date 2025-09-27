import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  Typography,
  IconButton,
  Divider,
  Button,
  Stack,
  Tooltip,
  DialogActions,
  Box,
  Grid,
  TextField,
  Card,
  CardContent,
  Chip,
  Fade,
  Slide,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material";
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as CartIcon,
  LocalShipping as ShippingIcon,
  Security as SecurityIcon,
  AttachMoney as MoneyIcon,
  ShoppingBag as BagIcon,
} from "@mui/icons-material";
import axiosInstance from "../../api/axiosInstance";
import PaymentModal from "./PaymentModal";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function CartModal({ open, handleClose, products }) {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [confirmClear, setConfirmClear] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [cartId, setCartId] = useState(null);
  const [checkoutTotal, setCheckoutTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Constants for better UX
  const FREE_SHIPPING_THRESHOLD = 100;
  const SHIPPING_COST = 9.99;

  const getUserId = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.id;
  };

  const getCartKey = useCallback(() => {
    const userId = getUserId();
    return userId ? `cart_${userId}` : null;
  }, []);

  const saveCart = (items) => {
    const cartKey = getCartKey();
    if (!cartKey) return;
    const cartData = {
      items: items.map((i) => ({ product: i.productId, quantity: i.quantity })),
    };
    localStorage.setItem(cartKey, JSON.stringify(cartData));
  };

  // Memoized calculations for performance
  const cartSummary = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const total = subtotal + shipping;
    const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

    return {
      subtotal,
      shipping,
      total,
      itemCount,
      freeShippingRemaining,
      qualifiesForFreeShipping: subtotal >= FREE_SHIPPING_THRESHOLD,
    };
  }, [cartItems]);

  useEffect(() => {
    if (!open) return;
    setError(null);
    const cartKey = getCartKey();
    if (!cartKey) {
      setCartItems([]);
      setQuantities({});
      return;
    }

    const storedCart = JSON.parse(localStorage.getItem(cartKey));
    if (storedCart?.items) {
      const enrichedItems = storedCart.items.map((item) => {
        const product = products.find((p) => p._id === item.product);
        return {
          productId: item.product,
          name: product?.name || `Product ID: ${item.product}`,
          price: product?.price || 0,
          quantity: item.quantity,
          total: (product?.price || 0) * item.quantity,
          image: product?.image || null,
          category: product?.category || 'General',
        };
      });
      setCartItems(enrichedItems);
      
      const initialQuantities = {};
      enrichedItems.forEach((i) => {
        initialQuantities[i.productId] = 1;
      });
      setQuantities(initialQuantities);
    } else {
      setCartItems([]);
      setQuantities({});
    }
  }, [open, products, getCartKey]);

  const updateCartItems = (newItems) => {
    setCartItems(newItems);
    saveCart(newItems);
  };

  const handleQtyChange = (productId, value) => {
    const item = cartItems.find((i) => i.productId === productId);
    if (!item) return;
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 1) {
      setQuantities((prev) => ({ ...prev, [productId]: 1 }));
    } else if (parsed > item.quantity) {
      setQuantities((prev) => ({ ...prev, [productId]: item.quantity }));
    } else {
      setQuantities((prev) => ({ ...prev, [productId]: parsed }));
    }
  };

  const incrementQty = (productId) => {
    const item = cartItems.find((i) => i.productId === productId);
    if (!item) return;
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const next = Math.min(current + 1, item.quantity);
      return { ...prev, [productId]: next };
    });
  };

  const decrementQty = (productId) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const next = Math.max(current - 1, 1);
      return { ...prev, [productId]: next };
    });
  };

  const handleRemoveQty = (productId) => {
    const amountToRemove = quantities[productId] || 1;
    const item = cartItems.find((i) => i.productId === productId);
    if (!item) return;

    if (amountToRemove >= item.quantity) {
      const updated = cartItems.filter((i) => i.productId !== productId);
      updateCartItems(updated);
    } else {
      const updated = cartItems.map((i) =>
        i.productId === productId
          ? {
              ...i,
              quantity: i.quantity - amountToRemove,
              total: i.price * (i.quantity - amountToRemove),
            }
          : i
      );
      updateCartItems(updated);
    }
    setQuantities((prev) => ({ ...prev, [productId]: 1 }));
  };

  const handleRemoveItem = (productId) => {
    const updated = cartItems.filter((item) => item.productId !== productId);
    updateCartItems(updated);
    setQuantities((prev) => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });
  };

  const handleClearCart = () => {
    updateCartItems([]);
    setConfirmClear(false);
    setQuantities({});
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = getUserId();
      if (!userId) {
        setError("Please log in to continue checkout");
        return;
      }

      const total = cartSummary.total;
      const payload = {
        userId,
        items: cartItems.map((item) => ({
          product: item.productId,
          quantity: item.quantity,
        })),
        value: total,
        status: "confirmed",
      };

      const response = await axiosInstance.post("/cart/add", payload);
      setCartId(response.data._id);
      setCheckoutTotal(total);
      setPaymentModalOpen(true);
      handleClearCart();
    } catch (error) {
      console.error("Checkout error:", error);
      setError("Failed to process checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = () => {
    setPaymentModalOpen(false);
    handleClearCart();
    handleClose();
    navigate("/user-dashboard");
  };

  const EmptyCart = () => (
    <Box 
      sx={{ 
        textAlign: "center", 
        py: 8, 
        px: 4,
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        borderRadius: 2,
        mx: 2,
        mb: 2
      }}
    >
      <BagIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
        Your cart is empty
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Discover amazing products and add them to your cart
      </Typography>
      <Button 
        variant="contained" 
        size="large"
        onClick={handleClose}
        sx={{ 
          px: 4, 
          py: 1.5,
          background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
          "&:hover": {
            background: "linear-gradient(45deg, #1976D2 30%, #0288D1 90%)",
          }
        }}
      >
        Continue Shopping
      </Button>
    </Box>
  );

  const CartItem = ({ item }) => (
    <Card 
      elevation={0} 
      sx={{ 
        mb: 2, 
        border: 1, 
        borderColor: "divider",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: 2,
        }
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={3} sm={2}>
            {item.image ? (
              <Box
                component="img"
                src={item.image}
                alt={item.name}
                sx={{
                  width: "100%",
                  maxWidth: 80,
                  height: 80,
                  objectFit: "cover",
                  borderRadius: 2,
                  border: 1,
                  borderColor: "divider",
                }}
              />
            ) : (
              <Paper
                elevation={0}
                sx={{
                  width: 80,
                  height: 80,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "grey.100",
                  borderRadius: 2,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  No Image
                </Typography>
              </Paper>
            )}
          </Grid>
          
          <Grid item xs={9} sm={10}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {item.name}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip 
                    label={item.category} 
                    size="small" 
                    variant="outlined"
                    sx={{ fontSize: '0.7rem' }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    ${item.price.toFixed(2)} each
                  </Typography>
                </Stack>
              </Box>

              <Stack 
                direction={{ xs: "column", sm: "row" }} 
                spacing={2} 
                alignItems={{ sm: "center" }}
                justifyContent="space-between"
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2" sx={{ minWidth: 60 }}>
                    Quantity:
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => decrementQty(item.productId)}
                    disabled={(quantities[item.productId] || 1) <= 1}
                    sx={{ 
                      border: 1, 
                      borderColor: "divider",
                      "&:hover": { borderColor: "primary.main" }
                    }}
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <TextField
                    size="small"
                    value={quantities[item.productId] || 1}
                    onChange={(e) => handleQtyChange(item.productId, e.target.value)}
                    inputProps={{ 
                      style: { textAlign: "center", width: 50 },
                      min: 1,
                      max: item.quantity 
                    }}
                    sx={{ 
                      "& .MuiOutlinedInput-root": {
                        height: 32,
                      }
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => incrementQty(item.productId)}
                    disabled={(quantities[item.productId] || 1) >= item.quantity}
                    sx={{ 
                      border: 1, 
                      borderColor: "divider",
                      "&:hover": { borderColor: "primary.main" }
                    }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                  <Typography variant="caption" color="text.secondary">
                    (Available: {item.quantity})
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main" }}>
                    ${item.total.toFixed(2)}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => handleRemoveQty(item.productId)}
                    variant="outlined"
                    color="warning"
                  >
                    Remove {quantities[item.productId] || 1}
                  </Button>
                  <Tooltip title="Remove Item Completely">
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveItem(item.productId)}
                      color="error"
                      sx={{ 
                        border: 1, 
                        borderColor: "error.main",
                        "&:hover": { bgcolor: "error.light", color: "white" }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const CartSummary = () => (
    <Paper elevation={2} sx={{ p: 3, bgcolor: "grey.50" }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Order Summary
      </Typography>
      
      <Stack spacing={2}>
        {!cartSummary.qualifiesForFreeShipping && cartSummary.freeShippingRemaining > 0 && (
          <Alert severity="info" icon={<ShippingIcon />}>
            Add ${cartSummary.freeShippingRemaining.toFixed(2)} more for free shipping!
          </Alert>
        )}

        {cartSummary.qualifiesForFreeShipping && (
          <Alert severity="success" icon={<ShippingIcon />}>
            🎉 You qualify for free shipping!
          </Alert>
        )}

        <Stack direction="row" justifyContent="space-between">
          <Typography>Items ({cartSummary.itemCount}):</Typography>
          <Typography>${cartSummary.subtotal.toFixed(2)}</Typography>
        </Stack>

        <Stack direction="row" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <ShippingIcon fontSize="small" />
            <Typography>Shipping:</Typography>
          </Stack>
          <Typography color={cartSummary.shipping === 0 ? "success.main" : "text.primary"}>
            {cartSummary.shipping === 0 ? "FREE" : `$${cartSummary.shipping.toFixed(2)}`}
          </Typography>
        </Stack>

        <Divider />

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Total:
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>
            ${cartSummary.total.toFixed(2)}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <SecurityIcon fontSize="small" color="success" />
          <Typography variant="caption" color="text.secondary">
            Secure checkout with 256-bit SSL encryption
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        TransitionComponent={Transition}
        PaperProps={{
          sx: { 
            borderRadius: 3,
            maxHeight: "90vh"
          }
        }}
      >
        <DialogTitle sx={{ 
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          py: 2
        }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center">
              <CartIcon sx={{ fontSize: 28 }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Shopping Cart
                </Typography>
                {cartItems.length > 0 && (
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    {cartSummary.itemCount} {cartSummary.itemCount === 1 ? 'item' : 'items'}
                  </Typography>
                )}
              </Box>
            </Stack>
            <IconButton 
              onClick={handleClose}
              sx={{ 
                color: "white",
                "&:hover": { bgcolor: "rgba(255,255,255,0.1)" }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {error && (
            <Alert severity="error" sx={{ m: 2, mb: 1 }}>
              {error}
            </Alert>
          )}

          {cartItems.length === 0 ? (
            <EmptyCart />
          ) : (
            <Grid container spacing={3} sx={{ p: 3 }}>
              <Grid item xs={12} lg={8}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Cart Items
                </Typography>
                {cartItems.map((item) => (
                  <Fade in key={item.productId} timeout={300}>
                    <Box>
                      <CartItem item={item} />
                    </Box>
                  </Fade>
                ))}
                
                {!confirmClear ? (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setConfirmClear(true)}
                    startIcon={<DeleteIcon />}
                    sx={{ mt: 2 }}
                  >
                    Clear All Items
                  </Button>
                ) : (
                  <Paper elevation={1} sx={{ p: 2, mt: 2, bgcolor: "error.light" }}>
                    <Typography variant="body1" sx={{ mb: 2, color: "error.dark" }}>
                      Are you sure you want to clear your entire cart?
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={handleClearCart}
                      >
                        Yes, Clear Cart
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setConfirmClear(false)}
                      >
                        Cancel
                      </Button>
                    </Stack>
                  </Paper>
                )}
              </Grid>

              <Grid item xs={12} lg={4}>
                <CartSummary />
              </Grid>
            </Grid>
          )}
        </DialogContent>

        {cartItems.length > 0 && (
          <DialogActions sx={{ p: 3, bgcolor: "grey.50" }}>
            <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
              <Button
                variant="outlined"
                size="large"
                onClick={handleClose}
                sx={{ flex: 1 }}
              >
                Continue Shopping
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={handleCheckout}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <MoneyIcon />}
                sx={{ 
                  flex: 2,
                  background: "linear-gradient(45deg, #4CAF50 30%, #45a049 90%)",
                  "&:hover": {
                    background: "linear-gradient(45deg, #45a049 30%, #3d8b40 90%)",
                  }
                }}
              >
                {loading ? "Processing..." : `Checkout - $${cartSummary.total.toFixed(2)}`}
              </Button>
            </Stack>
          </DialogActions>
        )}
      </Dialog>

      <PaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        totalAmount={checkoutTotal}
        cartId={cartId}
        onPaymentSuccess={handleConfirmPayment}
      />
    </>
  );
}

export default CartModal;