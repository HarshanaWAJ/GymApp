import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Stack,
  Paper,
  Divider,
  Badge,
  Container,
  alpha,
  Zoom,
  Fade,
  Tooltip,
  ListItemAvatar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
} from '@mui/material';
import {
  Close as CloseIcon,
  Notifications as NotificationsIcon,
  DeleteOutline as DeleteOutlineIcon,
  Person as PersonIcon,
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon,
  FitnessCenter as FitnessCenterIcon,
  Star as StarIcon,
  Alarm as AlarmIcon,
  EventNote as EventNoteIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

import axiosInstance from '../api/axiosInstance';

// AppointmentCard with edit and delete
function AppointmentCard({ appointment, onDelete, onEdit, index }) {
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await onDelete(appointment._id);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusDetails = (status) => {
    const statusMap = {
      pending: {
        color: '#ff9800',
        bgColor: alpha('#ff9800', 0.1),
        icon: <PendingIcon fontSize="small" />,
        label: 'Pending',
      },
      confirmed: {
        color: '#4caf50',
        bgColor: alpha('#4caf50', 0.1),
        icon: <CheckCircleIcon fontSize="small" />,
        label: 'Confirmed',
      },
      cancelled: {
        color: '#f44336',
        bgColor: alpha('#f44336', 0.1),
        icon: <CancelIcon fontSize="small" />,
        label: 'Cancelled',
      },
      completed: {
        color: '#2196f3',
        bgColor: alpha('#2196f3', 0.1),
        icon: <CheckCircleIcon fontSize="small" />,
        label: 'Completed',
      },
    };
    return statusMap[status] || statusMap.pending;
  };

  const statusDetails = getStatusDetails(appointment.status);
  const appointmentDate = appointment.date ? new Date(appointment.date) : null;
  const isUpcoming = appointmentDate && appointmentDate > new Date();

  return (
    <Zoom in={true} timeout={300 + index * 100}>
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
          border: '1px solid',
          borderColor: alpha('#1976d2', 0.12),
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'visible',
          '&:hover': {
            boxShadow: '0 20px 40px rgba(25, 118, 210, 0.15)',
            transform: 'translateY(-8px)',
            borderColor: 'primary.main',
          },
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${statusDetails.color}, ${alpha(statusDetails.color, 0.7)})`,
            borderRadius: '16px 16px 0 0',
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" spacing={3} alignItems="center" mb={3}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                fontSize: '1.5rem',
                fontWeight: 700,
                border: '3px solid white',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
              }}
            >
              {appointment.trainerId?.name?.[0] || 'T'}
            </Avatar>

            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{
                  background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  mb: 0.5,
                }}
              >
                {appointment.trainerId?.name || 'Unknown Trainer'}
              </Typography>

              <Stack direction="row" spacing={2} alignItems="center">
                <Chip
                  icon={statusDetails.icon}
                  label={statusDetails.label}
                  sx={{
                    bgcolor: statusDetails.bgColor,
                    color: statusDetails.color,
                    fontWeight: 600,
                    border: `1px solid ${alpha(statusDetails.color, 0.3)}`,
                    '& .MuiChip-icon': { color: statusDetails.color },
                  }}
                />
                {isUpcoming && (
                  <Chip
                    icon={<AlarmIcon />}
                    label="Upcoming"
                    size="small"
                    sx={{
                      bgcolor: alpha('#ff9800', 0.1),
                      color: '#ff9800',
                      fontWeight: 600,
                      border: `1px solid ${alpha('#ff9800', 0.3)}`,
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%': { opacity: 1 },
                        '50%': { opacity: 0.7 },
                        '100%': { opacity: 1 },
                      },
                    }}
                  />
                )}
              </Stack>
            </Box>
          </Stack>

          <Stack spacing={2}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: alpha('#1976d2', 0.04),
                borderRadius: 3,
                border: '1px solid',
                borderColor: alpha('#1976d2', 0.12),
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
                  <Typography variant="body1" fontWeight={600}>
                    {appointment.trainerId?.specialization || 'N/A'}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <StarIcon color="warning" fontSize="small" />
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Experience
                    </Typography>
                  </Stack>
                  <Typography variant="body1" fontWeight={600}>
                    {appointment.trainerId?.experience ?? 'N/A'} years
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarTodayIcon color="primary" fontSize="small" />
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Appointment Date
                </Typography>
              </Stack>
              <Typography
                variant="h6"
                fontWeight={600}
                color="primary.dark"
              >
                {appointmentDate
                  ? appointmentDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Date not available'}
              </Typography>

              {appointment.slotId && (
                <>
                  <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                    <AccessTimeIcon color="primary" fontSize="small" />
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Time Slot
                    </Typography>
                  </Stack>
                  <Typography variant="h6" fontWeight={600} color="primary.dark">
                    {appointment.slotId.day} • {appointment.slotId.startTime} - {appointment.slotId.endTime}
                  </Typography>
                </>
              )}
            </Stack>
          </Stack>
        </CardContent>

        <CardActions sx={{ px: 3, pb: 3, justifyContent: 'flex-end' }}>
          <Tooltip title="Edit Appointment">
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => onEdit(appointment)}
              sx={{
                borderRadius: 3,
                fontWeight: 600,
                mr: 1,
                background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1565c0, #1976d2)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                },
              }}
            >
              Edit
            </Button>
          </Tooltip>

          <Tooltip title="Delete Appointment">
            <Button
              variant="outlined"
              color="error"
              startIcon={deleteLoading ? <CircularProgress size={16} /> : <DeleteOutlineIcon />}
              disabled={deleteLoading}
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this appointment?')) {
                  handleDelete();
                }
              }}
              sx={{
                borderRadius: 3,
                fontWeight: 600,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
                },
              }}
            >
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </Tooltip>
        </CardActions>
      </Card>
    </Zoom>
  );
}

// Loading skeleton for card
function AppointmentSkeleton({ index }) {
  return (
    <Zoom in={true} timeout={300 + index * 100}>
      <Card sx={{ borderRadius: 4, p: 3 }}>
        <Stack direction="row" spacing={3} alignItems="center" mb={3}>
          <Box sx={{ width: 64, height: 64 }}>
            <CircularProgress />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ height: 32, width: '60%', backgroundColor: '#eee', mb: 1 }} />
            <Box sx={{ height: 24, width: '40%', backgroundColor: '#eee' }} />
          </Box>
        </Stack>
        <Box sx={{ height: 120, backgroundColor: '#eee', borderRadius: 3, mb: 2 }} />
        <Box sx={{ height: 24, width: '80%', backgroundColor: '#eee', mb: 1 }} />
        <Box sx={{ height: 24, width: '60%', backgroundColor: '#eee' }} />
      </Card>
    </Zoom>
  );
}

// The main MyAppointments component
function MyAppointments() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // For editing
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    setUser(parsedUser);
  }, []);

  useEffect(() => {
    if (!user?.name) {
      setLoading(false);
      setAppointments([]);
      return;
    }

    const fetchAppointments = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get('/bookings');
        const filtered = res.data.filter((b) => b.clientName === user.name);
        console.log('Fetched appointments:', filtered);
        
        setAppointments(filtered);
      } catch (err) {
        setError('Failed to load appointments.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  const handleDelete = async (bookingId) => {
    try {
      await axiosInstance.delete(`/bookings/${bookingId}`);
      setAppointments((prev) => prev.filter((a) => a._id !== bookingId));
    } catch (err) {
      console.error('Delete error', err);
      throw err;
    }
  };

  const handleEditClick = (appointment) => {
    setEditingAppointment(appointment);
    setEditDialogOpen(true);
  };

  const handleUpdated = (updatedAppt) => {
    setAppointments((prev) =>
      prev.map((a) => (a._id === updatedAppt._id ? { ...a, ...updatedAppt } : a))
    );
  };

  const getUpcomingAppointments = () => {
    const now = new Date();
    return appointments.filter((appt) => {
      if (!appt.date || !appt.slotId?.startTime) return false;
      const [hours, minutes] = appt.slotId.startTime.split(':');
      const apptDate = new Date(appt.date);
      apptDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      const diff = apptDate.getTime() - now.getTime();
      return diff > 0 && diff <= 60 * 60 * 1000;
    });
  };

  const upcomingAppointments = getUpcomingAppointments();
  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter((a) => a.status === 'completed').length;
  const upcomingCount = appointments.filter((a) => {
    const apptDate = new Date(a.date);
    return apptDate > new Date() && a.status !== 'cancelled';
  }).length;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 300,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          opacity: 0.1,
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 4 }}>
        <Fade in timeout={600}>
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h3"
              fontWeight={800}
              sx={{
                mb: 2,
                background: 'linear-gradient(45deg, #1976d2, #42a5f5, #1e88e5)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textAlign: 'center',
              }}
            >
              📅 My Fitness Journey
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ textAlign: 'center', mb: 4, maxWidth: 600, mx: 'auto' }}
            >
              Track your appointments, monitor progress, and stay on top of your fitness schedule
            </Typography>

            {!loading && totalAppointments > 0 && (
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                  <Paper
                    elevation={8}
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      background: 'linear-gradient(135deg, #4caf50, #81c784)',
                      color: 'white',
                      textAlign: 'center',
                      transition: 'transform 0.3s',
                      '&:hover': { transform: 'translateY(-4px)' },
                    }}
                  >
                    <EventNoteIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" fontWeight={700}>
                      {totalAppointments}
                    </Typography>
                    <Typography variant="body1">Total Sessions</Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Paper
                    elevation={8}
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      background: 'linear-gradient(135deg, #2196f3, #64b5f6)',
                      color: 'white',
                      textAlign: 'center',
                      transition: 'transform 0.3s',
                      '&:hover': { transform: 'translateY(-4px)' },
                    }}
                  >
                    <TrendingUpIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" fontWeight={700}>
                      {completedAppointments}
                    </Typography>
                    <Typography variant="body1">Completed</Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Paper
                    elevation={8}
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      background: 'linear-gradient(135deg, #ff9800, #ffb74d)',
                      color: 'white',
                      textAlign: 'center',
                      transition: 'transform 0.3s',
                      '&:hover': { transform: 'translateY(-4px)' },
                    }}
                  >
                    <ScheduleIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" fontWeight={700}>
                      {upcomingCount}
                    </Typography>
                    <Typography variant="body1">Upcoming</Typography>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Box>
        </Fade>

        {loading && (
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} sm={6} md={6} lg={4} key={i}>
                <AppointmentSkeleton index={i} />
              </Grid>
            ))}
          </Grid>
        )}

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
                borderRadius: 4,
              }}
            >
              <Typography color="error" variant="h6" gutterBottom>
                ❌ Oops! Something went wrong
              </Typography>
              <Typography color="text.secondary">{error}</Typography>
            </Paper>
          </Fade>
        )}

        {!loading && !error && appointments.length === 0 && (
          <Fade in>
            <Paper
              elevation={8}
              sx={{
                p: 6,
                textAlign: 'center',
                bgcolor: alpha('#2196f3', 0.04),
                border: '1px solid',
                borderColor: alpha('#2196f3', 0.2),
                borderRadius: 4,
              }}
            >
              <CalendarTodayIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 3 }} />
              <Typography variant="h5" gutterBottom fontWeight={700}>
                🌟 Start Your Fitness Journey!
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3, fontSize: '1.1rem' }}>
                You haven't booked any appointments yet. Ready to take the first step?
              </Typography>
              <Button
                variant="contained"
                size="large"
                sx={{
                  borderRadius: 3,
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1565c0, #1976d2)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(25, 118, 210, 0.3)',
                  },
                }}
              >
                Book Your First Session
              </Button>
            </Paper>
          </Fade>
        )}

        {!loading && !error && appointments.length > 0 && (
          <Grid container spacing={3}>
            {appointments.map((appointment, index) => (
              <Grid item xs={12} sm={6} lg={4} key={appointment._id}>
                <AppointmentCard
                  appointment={appointment}
                  onDelete={handleDelete}
                  onEdit={handleEditClick}
                  index={index}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {(upcomingAppointments.length > 0 || true) && (
          <Tooltip title="View Upcoming Notifications" arrow>
            <Badge badgeContent={upcomingAppointments.length} color="error">
              <Fab
                color="primary"
                onClick={() => setEditDialogOpen(false)}
                sx={{
                  position: 'fixed',
                  bottom: 32,
                  right: 32,
                  zIndex: 1300,
                  background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                  boxShadow: '0 8px 25px rgba(25, 118, 210, 0.4)',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    boxShadow: '0 12px 35px rgba(25, 118, 210, 0.5)',
                  },
                }}
              >
                <NotificationsIcon />
              </Fab>
            </Badge>
          </Tooltip>
        )}
      </Container>

      {/* Edit Appointment Dialog */}
      <EditAppointmentDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        appointment={editingAppointment}
        onUpdated={handleUpdated}
      />
    </Box>
  );
}

// EditAppointmentDialog defined inside the same file (or you can move it to a separate file)
function EditAppointmentDialog({ open, onClose, appointment, onUpdated }) {
  const [form, setForm] = useState(appointment || {});
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (appointment) {
      if (appointment.status !== 'pending') {
      alert('Only pending appointments can be edited.');
      onClose(); // Close the dialog
      return;
    }
      setForm(appointment);
      console.log('Editing appointment:', appointment);
      // Fetch slots
      if (appointment.trainerId?._id) {
        fetchSlots(appointment.trainerId._id);
      }
    }
  }, [appointment]);

  const fetchSlots = async (trainerId) => {
    setLoadingSlots(true);
    try {
      const res = await axiosInstance.get(`/timeslots/${trainerId}`);
      setSlots(res.data || []);
    } catch (err) {
      console.error('Failed to fetch slots:', err);
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

 const handleSave = async () => {
  if (!form._id) return;
  setUpdating(true);

  try {
    const payload = {
      slotId: form.slotId?._id || form.slotId,
      date: form.date,
      // We do NOT send status here since reschedule does not update status
    };

    // Make sure to replace ':bookingId' with actual booking ID in the URL
    await axiosInstance.put(`/bookings/reschedule/${form._id}`, payload);

    // Pass updated booking data back
    onUpdated({ ...form, ...payload });
    onClose();

    // Refresh the page
    window.location.reload();
  } catch (err) {
    console.error('Update failed:', err);
    alert('Failed to update the appointment. Please try again.');
  } finally {
    setUpdating(false);
  }
};

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Edit Appointment
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 12, right: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <TextField
            label="Date"
            type="date"
            fullWidth
            value={form.date ? form.date.slice(0, 10) : ''}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, date: e.target.value }))
            }
            InputLabelProps={{ shrink: true }}
          />

          <FormControl fullWidth disabled={loadingSlots}>
            <InputLabel>Select Time Slot</InputLabel>
            <Select
              value={form.slotId?._id || form.slotId || ''}
              label="Select Time Slot"
              onChange={(e) => {
                const selected = slots.find((s) => s._id === e.target.value);
                setForm((prev) => ({ ...prev, slotId: selected }));
              }}
            >
              {slots.map((slot) => (
                <MenuItem key={slot._id} value={slot._id}>
                  {slot.day} • {slot.startTime} - {slot.endTime}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={updating || loadingSlots}
        >
          {updating ? <CircularProgress size={18} /> : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default MyAppointments;
