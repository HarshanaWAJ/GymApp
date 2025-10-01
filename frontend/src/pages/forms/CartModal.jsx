import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Button,
  Stack,
  Box,
  Grid,
  TextField,
  Card,
  CardContent,
  Tooltip,
  Paper,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as CartIcon,
  Shipping as ShippingIcon,
  Security as SecurityIcon,
  AttachMoney as MoneyIcon,
  ShoppingBag as BagIcon,
} from "@mui/icons-material";
import Slide from "@mui/material/Slide";
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
      items: items.map((i) => ({
        product: i.productId,
        quantity: quantities[i.productId] || 1,
      })),
    };
    localStorage.setItem(cartKey, JSON.stringify(cartData));
  };

  const cartSummary = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => {
      const qty = quantities[item.productId] || 1;
      return sum + item.price * qty;
    }, 0);
    const itemCount = cartItems.reduce(
      (sum, item) => sum + (quantities[item.productId] || 1),
      0
    );
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const total = subtotal + shipping;
    const freeShippingRemaining = Math.max(
      0,
      FREE_SHIPPING_THRESHOLD - subtotal
    );

    return {
      subtotal,
      shipping,
      total,
      itemCount,
      freeShippingRemaining,
      qualifiesForFreeShipping: subtotal >= FREE_SHIPPING_THRESHOLD,
    };
  }, [cartItems, quantities]);

  useEffect(() => {
    if (!open) return;
    setError(null);
    const cartKey = getCartKey();
    if (!cartKey) return;

    const storedCart = JSON.parse(localStorage.getItem(cartKey));
    if (storedCart?.items) {
      const enrichedItems = storedCart.items
        .map((item) => {
          const product = products.find((p) => p._id === item.product);
          if (!product) return null;
          return {
            productId: item.product,
            name: product.name,
            price: product.price,
            quantity: product.quantity,
            image: product.image,
            category: product.category,
          };
        })
        .filter(Boolean);
      setCartItems(enrichedItems);

      const initialQuantities = {};
      storedCart.items.forEach((i) => {
        initialQuantities[i.product] = i.quantity;
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
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 1) return;
    const item = cartItems.find((i) => i.productId === productId);
    if (!item) return;
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.min(parsed, item.quantity),
    }));
  };

  const incrementQty = (productId) => {
    const item = cartItems.find((i) => i.productId === productId);
    if (!item) return;
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      return {
        ...prev,
        [productId]: Math.min(current + 1, item.quantity),
      };
    });
  };

  const decrementQty = (productId) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      return {
        ...prev,
        [productId]: Math.max(current - 1, 1),
      };
    });
  };

  const handleRemoveItem = (productId) => {
    const updated = cartItems.filter((item) => item.productId !== productId);
    updateCartItems(updated);
    setQuantities((prev) => {
      const q = { ...prev };
      delete q[productId];
      return q;
    });
  };

  const handleClearCart = () => {
    updateCartItems([]);
    setQuantities({});
    setConfirmClear(false);
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

      const payload = {
        userId,
        items: cartItems.map((item) => ({
          product: item.productId,
          quantity: quantities[item.productId] || 1,
        })),
        value: cartSummary.total,
        status: "confirmed",
      };

      const response = await axiosInstance.post("/cart/add", payload);
      setCartId(response.data._id);
      setCheckoutTotal(cartSummary.total);
      setPaymentModalOpen(true);
      handleClearCart();
    } catch (err) {
      console.error(err);
      setError("Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = () => {
    setPaymentModalOpen(false);
    handleClose();
    navigate("/user-dashboard");
  };

  const EmptyCart = () => (
    <Box textAlign="center" py={5}>
      <BagIcon sx={{ fontSize: 60, mb: 2 }} />
      <Typography variant="h6">Your cart is empty</Typography>
      <Button variant="contained" sx={{ mt: 2 }} onClick={handleClose}>
        Continue Shopping
      </Button>
    </Box>
  );

  const CartItem = ({ item }) => {
    const qty = quantities[item.productId] || 1;
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={3}>
              <img
                src={item.image}
                alt={item.name}
                style={{
                  width: "100%",
                  height: 80,
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
            </Grid>
            <Grid item xs={9}>
              <Typography variant="h6">{item.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                ${item.price.toFixed(2)} each
              </Typography>

              <Stack direction="row" alignItems="center" spacing={1} mt={1}>
                <IconButton
                  onClick={() => decrementQty(item.productId)}
                  disabled={qty <= 1}
                >
                  <RemoveIcon />
                </IconButton>
                <TextField
                  size="small"
                  value={qty}
                  onChange={(e) =>
                    handleQtyChange(item.productId, e.target.value)
                  }
                  inputProps={{ min: 1, max: item.quantity }}
                  sx={{ width: 60 }}
                />
                <IconButton
                  onClick={() => incrementQty(item.productId)}
                  disabled={qty >= item.quantity}
                >
                  <AddIcon />
                </IconButton>

                <Typography variant="subtitle1" sx={{ ml: 2 }}>
                  ${Number(item.price * qty).toFixed(2)}
                </Typography>
                <Tooltip title="Remove item">
                  <IconButton
                    onClick={() => handleRemoveItem(item.productId)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const CartSummary = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" mb={2}>
        Summary
      </Typography>
      <Stack spacing={1}>
        <Stack direction="row" justifyContent="space-between">
          <Typography>Subtotal:</Typography>
          <Typography>${cartSummary.subtotal.toFixed(2)}</Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography>Shipping:</Typography>
          <Typography>
            {cartSummary.shipping === 0
              ? "FREE"
              : `$${cartSummary.shipping.toFixed(2)}`}
          </Typography>
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h6">Total:</Typography>
          <Typography variant="h6" color="primary">
            ${cartSummary.total.toFixed(2)}
          </Typography>
        </Stack>
        {cartSummary.freeShippingRemaining > 0 && (
          <Alert severity="info">
            Add ${cartSummary.freeShippingRemaining.toFixed(2)} more to get
            free shipping!
          </Alert>
        )}
        <Stack direction="row" spacing={1} mt={2}>
          <SecurityIcon color="success" fontSize="small" />
          <Typography variant="caption" color="text.secondary">
            Secure checkout
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
        fullWidth
        maxWidth="md"
        TransitionComponent={Transition}
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center">
              <CartIcon />
              <Typography variant="h6">Shopping Cart</Typography>
            </Stack>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          {error && <Alert severity="error">{error}</Alert>}
          {cartItems.length === 0 ? (
            <EmptyCart />
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                {cartItems.map((item) => (
                  <CartItem key={item.productId} item={item} />
                ))}

                {!confirmClear ? (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setConfirmClear(true)}
                    startIcon={<DeleteIcon />}
                    sx={{ mt: 2 }}
                  >
                    Clear Cart
                  </Button>
                ) : (
                  <Stack direction="row" spacing={2} mt={2}>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={handleClearCart}
                    >
                      Confirm Clear
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setConfirmClear(false)}
                    >
                      Cancel
                    </Button>
                  </Stack>
                )}
              </Grid>

              <Grid item xs={12} md={4}>
                <CartSummary />
              </Grid>
            </Grid>
          )}
        </DialogContent>

        {cartItems.length > 0 && (
          <DialogActions sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} width="100%">
              <Button
                onClick={handleClose}
                fullWidth
                variant="outlined"
                size="large"
              >
                Continue Shopping
              </Button>
              <Button
                onClick={handleCheckout}
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                startIcon={
                  loading ? <CircularProgress size={20} /> : <MoneyIcon />
                }
              >
                {loading
                  ? "Processing..."
                  : `Checkout - $${cartSummary.total.toFixed(2)}`}
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
