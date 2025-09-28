// src/components/Appointments.jsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  TextField,
  Tooltip,
  Skeleton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Avatar,
  Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate, useLocation } from 'react-router-dom';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axiosInstance from '../api/axiosInstance';
import StoreUserSidebar from '../components/StoreUserSidebar';

// Days order constant for grouping
const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Helper to group slots by day of the week
const groupSlotsByDay = (slots) => {
  const grouped = {};
  daysOrder.forEach((d) => (grouped[d] = []));
  slots.forEach((slot) => {
    if (grouped[slot.day]) grouped[slot.day].push(slot);
    else grouped[slot.day] = [slot];
  });
  return grouped;
};

// Trainer card component showing details and available slots
function TrainerCard({ trainer, slots, onBook, onContact, onManageRating }) {
  const grouped = useMemo(() => groupSlotsByDay(slots), [slots]);

  return (
    <Card
      elevation={4}
      sx={{
        borderRadius: 3,
        mb: 3,
        p: 2,
        transition: '0.3s',
        '&:hover': { boxShadow: '0 6px 16px rgba(0,0,0,0.2)', transform: 'translateY(-3px)' },
      }}
    >
      <CardContent>
        {/* Header with image + name */}
        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
          <Avatar
            src={trainer.imageUrl}
            alt={trainer.name}
            sx={{ width: 72, height: 72, border: '2px solid #1976d2' }}
          >
            {trainer.name?.[0]}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700} color="primary.dark">
              {trainer.name}
            </Typography>
            <Chip
              label={trainer.available ? 'Available' : 'Unavailable'}
              color={trainer.available ? 'success' : 'error'}
              size="small"
              sx={{ fontWeight: 600, mt: 0.5 }}
            />
          </Box>
        </Stack>

        {/* Trainer details */}
        <Typography variant="body2" color="text.primary" gutterBottom>
          <strong>Specialization:</strong> {trainer.specialization}
        </Typography>
        <Typography variant="body2" color="text.primary" gutterBottom>
          <strong>Experience:</strong> {trainer.experience} years
        </Typography>
        <Typography variant="body2" color="text.primary" gutterBottom>
          <strong>Rating:</strong>{' '}
          {trainer.reviewSummary?.averageRating
            ? `${trainer.reviewSummary.averageRating.toFixed(1)} ⭐ (${trainer.reviewSummary.totalReviews} reviews)`
            : 'No ratings yet'}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Time slots */}
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Available Time Slots:
        </Typography>

        {slots.length === 0 ? (
          <Typography color="text.secondary" fontStyle="italic">
            No time slots available.
          </Typography>
        ) : (
          daysOrder.map((day) => (
            <Accordion
              key={day}
              sx={{
                bgcolor: 'grey.50',
                mb: 1,
                borderRadius: 2,
                '&:before': { display: 'none' },
              }}
              TransitionProps={{ unmountOnExit: true }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />} id={`${day}-header`}>
                <Typography sx={{ flexGrow: 1 }}>{day}</Typography>
                <Chip label={grouped[day]?.length || 0} size="small" color="primary" />
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={1}>
                  {grouped[day]?.map((slot) => {
                    const isBooked = slot.status === 'booked';
                    const isCanceled = slot.status === 'canceled';

                    return (
                      <Grid item key={slot._id}>
                        <Tooltip title={`Book slot from ${slot.startTime} to ${slot.endTime}`} arrow>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              if (!isBooked || isCanceled) onBook(trainer, slot);
                            }}
                            disabled={isBooked && !isCanceled}
                            sx={{
                              textTransform: 'none',
                              minWidth: 110,
                              borderRadius: 2,
                              bgcolor: isBooked && !isCanceled ? 'error.main' : 'white',
                              color: isBooked && !isCanceled ? 'white' : 'text.primary',
                              fontWeight: 600,
                              '&:hover': {
                                bgcolor: isBooked && !isCanceled ? 'error.main' : 'primary.light',
                              },
                            }}
                          >
                            {slot.startTime} - {slot.endTime}
                          </Button>
                        </Tooltip>
                      </Grid>
                    );
                  })}
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
        <Button size="small" variant="outlined" onClick={() => onManageRating(trainer)}>
          Manage Rating
        </Button>
        <Button size="small" variant="contained" color="secondary" onClick={() => onContact(trainer)}>
          Contact Trainer
        </Button>
      </CardActions>
    </Card>
  );
}

// Main appointments component
export default function Appointments() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [trainers, setTrainers] = useState([]);
  const [timeSlots, setTimeSlots] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Load user from localStorage on mount and location change
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    setUser(parsedUser);
  }, [location]);

  // Fetch trainers, reviews, and time slots on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch trainers
        const trainersRes = await axiosInstance.get('/trainers');
        const trainersData = trainersRes.data;

        // Fetch review summaries for trainers
        const summaryPromises = trainersData.map((t) =>
          axiosInstance.get(`/reviews/${t._id}/summary`).then((res) => res.data).catch(() => null)
        );
        const summaries = await Promise.all(summaryPromises);

        // Combine trainer info with review summaries
        const enriched = trainersData.map((t, i) => ({
          ...t,
          reviewSummary: summaries[i],
        }));
        setTrainers(enriched);

        // Fetch timeslots for each trainer
        const slotsPromises = enriched.map((t) =>
          axiosInstance.get(`/timeslots/${t._id}`).then((res) => res.data).catch(() => [])
        );
        const slotsArr = await Promise.all(slotsPromises);

        // Map trainer IDs to their timeslots
        const map = {};
        enriched.forEach((t, i) => {
          map[t._id] = slotsArr[i];
        });
        setTimeSlots(map);
      } catch (err) {
        console.error(err);
        setError('Failed to load trainers or time slots.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter trainers by search term (case insensitive)
  const filteredTrainers = useMemo(() => {
    return trainers.filter((t) => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [trainers, searchTerm]);

  // Open booking modal and initialize form
  const handleBook = (trainer, slot) => {
    setSelectedTrainer(trainer);
    setSelectedSlot(slot);
    setClientName(user?.name || '');
    setClientPhone('');
    setClientEmail('');
    setSelectedDate(null);
    setBookingModalOpen(true);
  };

  // Show trainer contact info in snackbar
  const handleContact = (trainer) => {
    setSnackbar({
      open: true,
      message: `Phone: ${trainer.contact?.phone || 'N/A'}\nEmail: ${trainer.contact?.email || 'N/A'}`,
      severity: 'info',
    });
  };

  // Navigate to rating management page for user and trainer
  const handleManageRating = (trainer) => {
    if (user?.name && trainer._id) {
      const username = user.name;
      navigate(`/user-rate-management/${username}/${trainer._id}`);
    } else {
      setSnackbar({ open: true, message: 'User not logged in.', severity: 'warning' });
    }
  };

  // Confirm booking handler: validate input and submit booking
  const handleConfirmBooking = async () => {
    if (!clientName.trim()) {
      setSnackbar({ open: true, message: 'Please enter your name.', severity: 'warning' });
      return;
    }
    if (!selectedDate) {
      setSnackbar({ open: true, message: 'Please select an appointment date.', severity: 'warning' });
      return;
    }

    setBookingLoading(true);

    try {
      await axiosInstance.post(`/bookings/${selectedTrainer._id}/${selectedSlot._id}`, {
        clientName: clientName.trim(),
        clientContact: {
          phone: clientPhone.trim(),
          email: clientEmail.trim(),
        },
        date: selectedDate.toISOString(),
      });

      setSnackbar({ open: true, message: 'Booking confirmed successfully!', severity: 'success' });
      setBookingModalOpen(false);
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to book the appointment.',
        severity: 'error',
      });
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f7fa' }}>
      {/* Sidebar */}
      <Box sx={{ width: 180, bgcolor: 'primary.main', color: 'white', p: 2 }}>
        <StoreUserSidebar />
      </Box>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, marginLeft: '180px', overflowY: 'auto' }}>
        <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
          Trainer Appointments
        </Typography>

        <TextField
          label="Search Trainers"
          variant="outlined"
          fullWidth
          margin="normal"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Loading skeleton placeholders */}
        {loading && (
          <>
            <Skeleton variant="rectangular" height={120} sx={{ mb: 2, borderRadius: 3 }} />
            <Skeleton variant="rectangular" height={120} sx={{ mb: 2, borderRadius: 3 }} />
            <Skeleton variant="rectangular" height={120} sx={{ mb: 2, borderRadius: 3 }} />
          </>
        )}

        {/* Error message */}
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        {/* Trainer cards */}
        {!loading && !error && filteredTrainers.length === 0 && (
          <Typography>No trainers found matching your search.</Typography>
        )}

        {!loading &&
          !error &&
          filteredTrainers.map((trainer) => (
            <TrainerCard
              key={trainer._id}
              trainer={trainer}
              slots={timeSlots[trainer._id] || []}
              onBook={handleBook}
              onContact={handleContact}
              onManageRating={handleManageRating}
            />
          ))}

        {/* Booking dialog */}
        <Dialog open={bookingModalOpen} onClose={() => setBookingModalOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>
            Book Appointment
            <IconButton
              aria-label="close"
              onClick={() => setBookingModalOpen(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
              size="large"
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Trainer: {selectedTrainer?.name}
            </Typography>

            <Typography variant="body2" gutterBottom>
              Slot: {selectedSlot?.startTime} - {selectedSlot?.endTime} on {selectedSlot?.day}
            </Typography>

            <TextField
              label="Your Name"
              fullWidth
              margin="normal"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
            />
            <TextField
              label="Phone Number"
              fullWidth
              margin="normal"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
            />
            <TextField
              label="Email Address"
              fullWidth
              margin="normal"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
            />

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Select Appointment Date"
                value={selectedDate}
                onChange={(newDate) => setSelectedDate(newDate)}
                disablePast
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
              />
            </LocalizationProvider>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setBookingModalOpen(false)}>Cancel</Button>
            <Button
              onClick={handleConfirmBooking}
              disabled={bookingLoading}
              variant="contained"
              color="primary"
            >
              {bookingLoading ? 'Booking...' : 'Confirm'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message.split('\n').map((line, idx) => (
              <span key={idx}>
                {line}
                <br />
              </span>
            ))}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}
