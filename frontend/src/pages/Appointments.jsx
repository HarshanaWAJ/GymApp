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
  Badge,
  Rating,
  Fade,
  Zoom,
  Paper,
  InputAdornment,
  Container,
  alpha,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ChatIcon from '@mui/icons-material/Chat';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { useNavigate, useLocation } from 'react-router-dom';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axiosInstance from '../api/axiosInstance';

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

// Enhanced trainer card component
function TrainerCard({ trainer, slots, onBook, onContact, onManageRating, index }) {
  const grouped = useMemo(() => groupSlotsByDay(slots), [slots]);
  const availableSlots = slots.filter(slot => slot.status !== 'booked' || slot.status === 'canceled').length;

  return (
    <Zoom in={true} timeout={300 + index * 100}>
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          mb: 3,
          p: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
          border: '1px solid',
          borderColor: 'rgba(25, 118, 210, 0.12)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'visible',
          '&:hover': { 
            boxShadow: '0 20px 40px rgba(25, 118, 210, 0.15)',
            transform: 'translateY(-8px)',
            borderColor: 'primary.main',
            '& .trainer-avatar': {
              transform: 'scale(1.1)',
              boxShadow: '0 8px 25px rgba(25, 118, 210, 0.3)'
            }
          },
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: trainer.available 
              ? 'linear-gradient(90deg, #4caf50 0%, #81c784 100%)'
              : 'linear-gradient(90deg, #f44336 0%, #e57373 100%)',
            borderRadius: '16px 16px 0 0'
          }
        }}
      >
        <CardContent sx={{ pb: 1 }}>
          {/* Header with enhanced image + info */}
          <Stack direction="row" spacing={3} alignItems="center" mb={3}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={trainer.imageUrl}
                alt={trainer.name}
                className="trainer-avatar"
                sx={{ 
                  width: 80, 
                  height: 80, 
                  border: '3px solid',
                  borderColor: trainer.available ? 'success.main' : 'error.main',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontSize: '2rem',
                  fontWeight: 700,
                  background: trainer.available 
                    ? 'linear-gradient(135deg, #4caf50, #81c784)'
                    : 'linear-gradient(135deg, #f44336, #e57373)',
                  color: 'white'
                }}
              >
                {trainer.name?.[0]}
              </Avatar>
              <Badge
                badgeContent={availableSlots}
                color="primary"
                sx={{
                  position: 'absolute',
                  bottom: -5,
                  right: -5,
                  '& .MuiBadge-badge': {
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    minWidth: 24,
                    height: 24
                  }
                }}
              />
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h5" 
                fontWeight={700} 
                color="primary.dark"
                sx={{ 
                  mb: 1,
                  background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {trainer.name}
              </Typography>
              
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <Chip
                  label={trainer.available ? '🟢 Available' : '🔴 Unavailable'}
                  color={trainer.available ? 'success' : 'error'}
                  size="medium"
                  sx={{ 
                    fontWeight: 600,
                    borderRadius: 2,
                    '& .MuiChip-label': { px: 2 }
                  }}
                />
                <Chip
                  icon={<AccessTimeIcon />}
                  label={`${availableSlots} slots`}
                  variant="outlined"
                  size="small"
                  color="primary"
                />
              </Stack>

              {/* Rating display */}
              {trainer.reviewSummary?.averageRating && (
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <Rating 
                    value={trainer.reviewSummary.averageRating} 
                    readOnly 
                    size="small"
                    precision={0.1}
                  />
                  <Typography variant="body2" color="text.primary" fontWeight={600}>
                    {trainer.reviewSummary.averageRating.toFixed(1)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({trainer.reviewSummary.totalReviews} reviews)
                  </Typography>
                </Stack>
              )}
            </Box>
          </Stack>

          {/* Enhanced trainer details */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              mb: 3, 
              bgcolor: alpha('#1976d2', 0.04),
              borderRadius: 3,
              border: '1px solid',
              borderColor: alpha('#1976d2', 0.12)
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <FitnessCenterIcon color="primary" fontSize="small" />
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Specialization
                  </Typography>
                </Stack>
                <Typography variant="body1" fontWeight={600} color="primary.dark">
                  {trainer.specialization}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <StarIcon color="warning" fontSize="small" />
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Experience
                  </Typography>
                </Stack>
                <Typography variant="body1" fontWeight={600} color="primary.dark">
                  {trainer.experience} years
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Enhanced time slots */}
          <Typography 
            variant="h6" 
            fontWeight={700} 
            gutterBottom
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 2
            }}
          >
            <CalendarTodayIcon color="primary" />
            Available Time Slots
          </Typography>

          {slots.length === 0 ? (
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                textAlign: 'center',
                bgcolor: alpha('#f44336', 0.04),
                border: '1px solid',
                borderColor: alpha('#f44336', 0.12),
                borderRadius: 3
              }}
            >
              <Typography color="text.secondary" fontStyle="italic" variant="body1">
                🚫 No time slots available at the moment
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={1}>
              {daysOrder.map((day) => {
                const daySlots = grouped[day] || [];
                if (daySlots.length === 0) return null;

                return (
                  <Accordion
                    key={day}
                    sx={{
                      bgcolor: 'background.paper',
                      borderRadius: '12px !important',
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      '&:before': { display: 'none' },
                      '&.Mui-expanded': {
                        boxShadow: '0 4px 16px rgba(25, 118, 210, 0.12)',
                        borderColor: 'primary.light'
                      }
                    }}
                  >
                    <AccordionSummary 
                      expandIcon={<ExpandMoreIcon color="primary" />}
                      sx={{ 
                        minHeight: 56,
                        '& .MuiAccordionSummary-content': {
                          alignItems: 'center',
                          margin: '12px 0'
                        }
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                        <Typography variant="subtitle1" fontWeight={600} color="primary.dark">
                          📅 {day}
                        </Typography>
                        <Chip 
                          label={daySlots.length} 
                          size="small" 
                          color="primary"
                          sx={{ minWidth: 32 }}
                        />
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                      <Grid container spacing={1.5}>
                        {daySlots.map((slot) => {
                          const isBooked = slot.status === 'booked';
                          const isCanceled = slot.status === 'canceled';
                          const isAvailable = !isBooked || isCanceled;

                          return (
                            <Grid item key={slot._id}>
                              <Tooltip 
                                title={
                                  isAvailable 
                                    ? `Click to book: ${slot.startTime} - ${slot.endTime}`
                                    : `This slot is already booked`
                                }
                                arrow
                              >
                                <Button
                                  variant={isAvailable ? "contained" : "outlined"}
                                  size="medium"
                                  onClick={() => {
                                    if (isAvailable) onBook(trainer, slot);
                                  }}
                                  disabled={!isAvailable}
                                  sx={{
                                    textTransform: 'none',
                                    minWidth: 130,
                                    borderRadius: 3,
                                    fontWeight: 600,
                                    py: 1,
                                    px: 2,
                                    background: isAvailable 
                                      ? 'linear-gradient(135deg, #1976d2, #42a5f5)'
                                      : 'transparent',
                                    color: isAvailable ? 'white' : 'text.disabled',
                                    border: isAvailable ? 'none' : '2px solid #e0e0e0',
                                    '&:hover': {
                                      background: isAvailable 
                                        ? 'linear-gradient(135deg, #1565c0, #1976d2)'
                                        : 'transparent',
                                      transform: isAvailable ? 'translateY(-2px)' : 'none',
                                      boxShadow: isAvailable 
                                        ? '0 6px 20px rgba(25, 118, 210, 0.3)'
                                        : 'none'
                                    },
                                    '&:disabled': {
                                      opacity: 0.5
                                    }
                                  }}
                                >
                                  <AccessTimeIcon sx={{ mr: 1, fontSize: '1rem' }} />
                                  {slot.startTime} - {slot.endTime}
                                </Button>
                              </Tooltip>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Stack>
          )}
        </CardContent>

        {/* Enhanced actions */}
        <CardActions sx={{ justifyContent: 'space-between', px: 3, pt: 2, pb: 2 }}>
          <Button 
            variant="outlined" 
            size="large"
            startIcon={<StarIcon />}
            onClick={() => onManageRating(trainer)}
            sx={{
              borderRadius: 3,
              fontWeight: 600,
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)'
              }
            }}
          >
            Rate Trainer
          </Button>
          <Button 
            variant="contained" 
            size="large"
            startIcon={<ChatIcon />}
            onClick={() => onContact(trainer)}
            sx={{
              borderRadius: 3,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #ff9800, #ffb74d)',
              '&:hover': {
                background: 'linear-gradient(135deg, #f57c00, #ff9800)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(255, 152, 0, 0.3)'
              }
            }}
          >
            Contact
          </Button>
        </CardActions>
      </Card>
    </Zoom>
  );
}

// Main appointments component with enhanced UI
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
    return trainers.filter((t) => 
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [trainers, searchTerm]);

  // Open booking modal and initialize form
  const handleBook = (trainer, slot) => {
    setSelectedTrainer(trainer);
    setSelectedSlot(slot);
    setClientName(user?.name || '');
    setClientPhone('');
    setClientEmail(user?.email || '');
    setSelectedDate(null);
    setBookingModalOpen(true);
  };

  // Show trainer contact info in enhanced snackbar
  const handleContact = (trainer) => {
    setSnackbar({
      open: true,
      message: `📞 Phone: ${trainer.contact?.phone || 'N/A'}\n📧 Email: ${trainer.contact?.email || 'N/A'}`,
      severity: 'info',
    });
  };

  // Navigate to rating management page for user and trainer
  const handleManageRating = (trainer) => {
    if (user?.name && trainer._id) {
      const username = user.name;
      navigate(`/user-rate-management/${username}/${trainer._id}`);
    } else {
      setSnackbar({ open: true, message: 'Please log in to rate trainers.', severity: 'warning' });
    }
  };

  // Confirm booking handler with enhanced validation
  const handleConfirmBooking = async () => {
    if (!clientName.trim()) {
      setSnackbar({ open: true, message: '⚠️ Please enter your name.', severity: 'warning' });
      return;
    }
    if (!selectedDate) {
      setSnackbar({ open: true, message: '⚠️ Please select an appointment date.', severity: 'warning' });
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

      setSnackbar({ 
        open: true, 
        message: '🎉 Booking confirmed successfully! You will receive a confirmation email.', 
        severity: 'success' 
      });
      setBookingModalOpen(false);
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: `❌ ${err.response?.data?.message || 'Failed to book the appointment. Please try again.'}`,
        severity: 'error',
      });
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      position: 'relative'
    }}>
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 300,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          opacity: 0.1,
          zIndex: 0
        }}
      />
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 4 }}>
        {/* Enhanced header */}
        <Fade in timeout={600}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h3" 
              fontWeight={800} 
              sx={{ 
                mb: 2,
                background: 'linear-gradient(45deg, #1976d2, #42a5f5, #1e88e5)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              🏋️‍♂️ Find Your Perfect Trainer
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
              Book appointments with certified fitness trainers and achieve your fitness goals
            </Typography>

            {/* Enhanced search */}
            <Paper 
              elevation={8}
              sx={{ 
                p: 1, 
                maxWidth: 500, 
                mx: 'auto',
                borderRadius: 6,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
                border: '1px solid',
                borderColor: alpha('#1976d2', 0.2)
              }}
            >
              <TextField
                placeholder="Search by trainer name or specialization..."
                variant="outlined"
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="primary" />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 6,
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none'
                    }
                  }
                }}
              />
            </Paper>
          </Box>
        </Fade>

        {/* Enhanced loading skeleton */}
        {loading && (
          <Stack spacing={3}>
            {[1, 2, 3].map((i) => (
              <Skeleton 
                key={i}
                variant="rectangular" 
                height={200} 
                sx={{ borderRadius: 4 }}
                animation="wave"
              />
            ))}
          </Stack>
        )}

        {/* Enhanced error message */}
        {error && (
          <Fade in>
            <Paper 
              elevation={4}
              sx={{ 
                p: 4, 
                textAlign: 'center',
                bgcolor: alpha('#f44336', 0.04),
                border: '1px solid',
                borderColor: alpha('#f44336', 0.2),
                borderRadius: 4
              }}
            >
              <Typography color="error" variant="h6" gutterBottom>
                ❌ Oops! Something went wrong
              </Typography>
              <Typography color="text.secondary">
                {error}
              </Typography>
            </Paper>
          </Fade>
        )}

        {/* No results message */}
        {!loading && !error && filteredTrainers.length === 0 && trainers.length > 0 && (
          <Fade in>
            <Paper 
              elevation={4}
              sx={{ 
                p: 4, 
                textAlign: 'center',
                bgcolor: alpha('#ff9800', 0.04),
                border: '1px solid',
                borderColor: alpha('#ff9800', 0.2),
                borderRadius: 4
              }}
            >
              <Typography variant="h6" gutterBottom>
                🔍 No trainers found
              </Typography>
              <Typography color="text.secondary">
                Try adjusting your search terms or browse all available trainers.
              </Typography>
            </Paper>
          </Fade>
        )}

        {/* Enhanced trainer cards */}
        {!loading && !error && filteredTrainers.map((trainer, index) => (
          <TrainerCard
            key={trainer._id}
            trainer={trainer}
            slots={timeSlots[trainer._id] || []}
            onBook={handleBook}
            onContact={handleContact}
            onManageRating={handleManageRating}
            index={index}
          />
        ))}

        {/* Enhanced booking dialog */}
        <Dialog 
          open={bookingModalOpen} 
          onClose={() => setBookingModalOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)'
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={1}>
                <BookmarkIcon color="primary" />
                <Typography variant="h5" fontWeight={700}>
                  Book Your Session
                </Typography>
              </Stack>
              <IconButton
                onClick={() => setBookingModalOpen(false)}
                sx={{ 
                  bgcolor: alpha('#1976d2', 0.1),
                  '&:hover': { bgcolor: alpha('#1976d2', 0.2) }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>

          <DialogContent dividers sx={{ px: 3, py: 3 }}>
            {/* Session details */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                mb: 3,
                bgcolor: alpha('#1976d2', 0.04),
                borderRadius: 3,
                border: '1px solid',
                borderColor: alpha('#1976d2', 0.12)
              }}
            >
              <Typography variant="h6" fontWeight={600} gutterBottom color="primary.dark">
                🏋️‍♂️ {selectedTrainer?.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                📅 {selectedSlot?.day} • ⏰ {selectedSlot?.startTime} - {selectedSlot?.endTime}
              </Typography>
            </Paper>

            {/* Form fields with icons */}
            <Stack spacing={3}>
              <TextField
                label="Your Full Name"
                fullWidth
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="primary" />
                    </InputAdornment>
                  )
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
              
              <TextField
                label="Phone Number"
                fullWidth
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="primary" />
                    </InputAdornment>
                  )
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
              
              <TextField
                label="Email Address"
                fullWidth
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="primary" />
                    </InputAdornment>
                  )
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Select Appointment Date"
                  value={selectedDate}
                  onChange={(newDate) => setSelectedDate(newDate)}
                  disablePast
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      required
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarTodayIcon color="primary" />
                          </InputAdornment>
                        )
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button 
              onClick={() => setBookingModalOpen(false)}
              variant="outlined"
              size="large"
              sx={{ 
                borderRadius: 3,
                fontWeight: 600,
                px: 4,
                borderWidth: 2,
                '&:hover': { borderWidth: 2 }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmBooking}
              disabled={bookingLoading}
              variant="contained"
              size="large"
              sx={{
                borderRadius: 3,
                fontWeight: 600,
                px: 4,
                background: 'linear-gradient(135deg, #4caf50, #81c784)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #388e3c, #4caf50)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(76, 175, 80, 0.3)'
                },
                '&:disabled': {
                  background: 'linear-gradient(135deg, #bdbdbd, #e0e0e0)'
                }
              }}
            >
              {bookingLoading ? (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box 
                    sx={{ 
                      width: 16, 
                      height: 16, 
                      border: '2px solid currentColor',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' }
                      }
                    }} 
                  />
                  <Typography>Booking...</Typography>
                </Stack>
              ) : (
                '🎉 Confirm Booking'
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Enhanced snackbar notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            variant="filled"
            sx={{ 
              width: '100%',
              borderRadius: 3,
              fontWeight: 600,
              fontSize: '1rem',
              '& .MuiAlert-icon': {
                fontSize: '1.5rem'
              }
            }}
          >
            {snackbar.message.split('\n').map((line, idx) => (
              <span key={idx}>
                {line}
                {idx < snackbar.message.split('\n').length - 1 && <br />}
              </span>
            ))}
          </Alert>
        </Snackbar>

        {/* Statistics footer */}
        {!loading && !error && trainers.length > 0 && (
          <Fade in timeout={1000}>
            <Paper 
              elevation={4}
              sx={{ 
                mt: 6,
                p: 4,
                borderRadius: 4,
                background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                color: 'white',
                textAlign: 'center'
              }}
            >
              <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                  <Typography variant="h3" fontWeight={700}>
                    {trainers.length}
                  </Typography>
                  <Typography variant="h6">
                    Expert Trainers
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="h3" fontWeight={700}>
                    {Object.values(timeSlots).flat().length}
                  </Typography>
                  <Typography variant="h6">
                    Available Slots
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="h3" fontWeight={700}>
                    {trainers.filter(t => t.available).length}
                  </Typography>
                  <Typography variant="h6">
                    Active Today
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Fade>
        )}
      </Container>
    </Box>
  );
}