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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsIcon from '@mui/icons-material/Notifications';
import StoreUserSidebar from '../components/StoreUserSidebar';
import axiosInstance from '../api/axiosInstance';

function MyAppointments() {
  const sidebarWidth = 200;
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);

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
        const res = await axiosInstance.get('/bookings'); // fetch all bookings
        // Filter bookings by logged-in user's name
        const filtered = res.data.filter((b) => b.clientName === user.name);
        setAppointments(filtered);
      } catch (err) {
        setError('Failed to load appointments.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  // Helper function to get readable status color for Chip
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'completed':
        return 'primary';
      default:
        return 'default';
    }
  };

  // Delete appointment handler
  const handleDelete = async (bookingId) => {
    try {
      await axiosInstance.delete(`/bookings/${bookingId}`);
      setAppointments((prev) => prev.filter((a) => a._id !== bookingId));
    } catch (err) {
      alert('Failed to delete appointment');
    }
  };

  // Get appointments within next hour
  const getUpcomingAppointments = () => {
    const now = new Date();

    return appointments.filter((appt) => {
      if (!appt.date || !appt.slotId?.startTime) return false;

      const [hours, minutes] = appt.slotId.startTime.split(':');
      const apptDate = new Date(appt.date);

      // Set slot start time on apptDate
      apptDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

      // Calculate difference in milliseconds
      const diff = apptDate.getTime() - now.getTime();

      // Return true if appointment is within the next hour
      return diff > 0 && diff <= 60 * 60 * 1000;
    });
  };

  const upcomingAppointments = getUpcomingAppointments();

  // DEBUG LOGS
  console.log('All appointments:', appointments);
  console.log('Upcoming appointments (next hour):', upcomingAppointments);

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f7fa' }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: `${sidebarWidth}px`,
          bgcolor: '#1976d2',
          color: '#fff',
          px: 2,
          py: 3,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
          User Panel
        </Typography>
        <StoreUserSidebar />
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        <Typography variant="h4" fontWeight="bold" mb={3}>
          My Appointments
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={5}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : appointments.length === 0 ? (
          <Alert severity="info">No appointments found.</Alert>
        ) : (
          <Grid container spacing={3}>
            {appointments.map((appt) => (
              <Grid item xs={12} sm={6} md={4} key={appt._id}>
                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Trainer: {appt.trainerId?.name || 'Unknown Trainer'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Specialization: {appt.trainerId?.specialization || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Experience: {appt.trainerId?.experience ?? 'N/A'} years
                    </Typography>

                    <Typography variant="body2" gutterBottom>
                      <strong>Appointment Slot:</strong>{' '}
                      {appt.slotId
                        ? `${appt.slotId.day} ${appt.slotId.startTime} - ${appt.slotId.endTime}`
                        : 'N/A'}
                    </Typography>

                    <Typography variant="body2" gutterBottom>
                      <strong>Date:</strong>{' '}
                      {appt.date ? new Date(appt.date).toLocaleDateString() : 'N/A'}
                    </Typography>

                    <Typography variant="body2" gutterBottom>
                      <Chip
                        label={appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                        color={getStatusColor(appt.status)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => {
                        if (
                          window.confirm(
                            'Are you sure you want to delete this appointment?'
                          )
                        ) {
                          handleDelete(appt._id);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Floating notification button */}
        {/* TEMPORARILY set to true for testing — change to upcomingAppointments.length > 0 to enable filtering */}
        {(true /*upcomingAppointments.length > 0*/) && (
          <>
            <Fab
              color="primary"
              aria-label="notifications"
              onClick={() => setNotifOpen(true)}
              sx={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                zIndex: 1300,
              }}
            >
              <NotificationsIcon />
            </Fab>

            <Dialog
              open={notifOpen}
              onClose={() => setNotifOpen(false)}
              aria-labelledby="upcoming-appointments-dialog"
            >
              <DialogTitle sx={{ m: 0, p: 2 }}>
                Upcoming Appointments
                <IconButton
                  aria-label="close"
                  onClick={() => setNotifOpen(false)}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent dividers>
                <List>
                  {upcomingAppointments.length === 0 ? (
                    <Typography sx={{ p: 2 }}>
                      No upcoming appointments within the next hour.
                    </Typography>
                  ) : (
                    upcomingAppointments.map((appt) => {
                      const [hours, minutes] = appt.slotId.startTime.split(':');
                      const apptDate = new Date(appt.date);
                      apptDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

                      return (
                        <ListItem key={appt._id} divider>
                          <ListItemText
                            primary={`Trainer: ${appt.trainerId?.name || 'Unknown Trainer'}`}
                            secondary={`On ${apptDate.toLocaleString()} - Status: ${
                              appt.status.charAt(0).toUpperCase() + appt.status.slice(1)
                            }`}
                          />
                        </ListItem>
                      );
                    })
                  )}
                </List>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setNotifOpen(false)} color="primary">
                  Close
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </Box>
    </Box>
  );
}

export default MyAppointments;
