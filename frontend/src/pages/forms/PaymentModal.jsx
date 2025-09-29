import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  TextField,
  Box,
  Alert,
  InputAdornment,
  Tooltip,
  IconButton,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import axiosInstance from "../../api/axiosInstance";

// Helpers for formatting inputs (same as before)
const formatCardNumber = (value) => {
  return value
    .replace(/\D/g, "")
    .replace(/(.{4})/g, "$1 ")
    .trim();
};
const formatExpDate = (value) => {
  const val = value.replace(/\D/g, "");
  if (val.length === 0) return "";
  if (val.length < 3) return val;
  return val.slice(0, 2) + "/" + val.slice(2, 4);
};

function PaymentModal({ open, onClose, totalAmount, cartId, onPaymentSuccess }) {
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expDate, setExpDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errors, setErrors] = useState({});

  // New state to hold the logged in user's email
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    // Read the user email from localStorage when the modal opens
    if (open) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUserEmail(parsedUser.email || null);
        } catch {
          setUserEmail(null);
        }
      } else {
        setUserEmail(null);
      }
    }
  }, [open]);

  // Validation functions (same as before)
  const validateCardHolder = (name) => name.trim().length > 0;
  const validateCardNumber = (num) => /^\d{13,19}$/.test(num.replace(/\s/g, ""));
  const validateExpDate = (date) => {
    if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(date)) return false;
    const [month, year] = date.split("/");
    const expiry = new Date(`20${year}`, month);
    const now = new Date();
    return expiry > now;
  };
  const validateCvv = (value) => /^\d{3,4}$/.test(value);

  const handlePayment = async () => {
    const newErrors = {};
    if (!validateCardHolder(cardHolder)) newErrors.cardHolder = "Card holder name is required.";
    if (!validateCardNumber(cardNumber)) newErrors.cardNumber = "Card number must be 13 to 19 digits.";
    if (!validateExpDate(expDate)) newErrors.expDate = "Expiration date must be in MM/YY format and valid.";
    if (!validateCvv(cvv)) newErrors.cvv = "CVV must be 3 or 4 digits.";
    if (!cartId) newErrors.cartId = "Invalid cart ID.";
    if (!userEmail) newErrors.email = "User email not found. Please log in.";

    setErrors(newErrors);
    setError(null);
    setSuccessMsg(null);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const paymentPayload = {
        cart: cartId,
        payment: totalAmount,
        card_holder: cardHolder.trim(),
        card_number: cardNumber.replace(/\s/g, ""),
        exp_date: expDate.trim(),
        email: userEmail,
      };

      await axiosInstance.post("/payment/add", paymentPayload);
      await axiosInstance.put(`/cart/update/${cartId}`, { status: "payed" });

      setSuccessMsg("Payment successful!");
      onPaymentSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccessMsg(null);
    setCardHolder("");
    setCardNumber("");
    setExpDate("");
    setCvv("");
    setErrors({});
    setUserEmail(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.5rem", textAlign: "center" }}>
        Secure Payment
      </DialogTitle>
      <DialogContent>
        <Typography
          gutterBottom
          variant="body1"
          sx={{ textAlign: "center", mb: 3, color: "text.secondary" }}
        >
          Enter your card details to complete the payment of <strong>${totalAmount.toFixed(2)}</strong>.
        </Typography>

        <Box component="form" noValidate autoComplete="off" sx={{ mt: 1 }}>
          <TextField
            label="Card Holder Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={cardHolder}
            onChange={(e) => setCardHolder(e.target.value)}
            disabled={loading}
            error={!!errors.cardHolder}
            helperText={errors.cardHolder}
            inputProps={{ maxLength: 50 }}
          />

          <TextField
            label="Card Number"
            variant="outlined"
            fullWidth
            margin="normal"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            disabled={loading}
            error={!!errors.cardNumber}
            helperText={errors.cardNumber || "Enter 13 to 19 digits"}
            inputProps={{ maxLength: 23 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CreditCardIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <TextField
              label="Expiration Date (MM/YY)"
              variant="outlined"
              value={expDate}
              onChange={(e) => setExpDate(formatExpDate(e.target.value))}
              disabled={loading}
              error={!!errors.expDate}
              helperText={errors.expDate}
              inputProps={{ maxLength: 5, placeholder: "MM/YY" }}
              sx={{ flex: 1 }}
            />

            <TextField
              label="CVV"
              variant="outlined"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
              disabled={loading}
              error={!!errors.cvv}
              helperText={errors.cvv}
              inputProps={{ maxLength: 4, inputMode: "numeric" }}
              sx={{ flex: 1 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="3 or 4 digit security code on back of your card">
                      <IconButton edge="end" tabIndex={-1}>
                        <HelpOutlineIcon color="action" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 3, mb: 1, borderRadius: 1 }}>
            {error}
          </Alert>
        )}
        {successMsg && (
          <Alert severity="success" sx={{ mt: 3, mb: 1, borderRadius: 1 }}>
            {successMsg}
          </Alert>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 2,
          pt: 1,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button onClick={handleClose} disabled={loading} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handlePayment}
          disabled={loading}
          sx={{ minWidth: 140, fontWeight: "bold" }}
        >
          {loading ? "Processing..." : "Confirm Payment"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PaymentModal;
