import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Select,
  MenuItem,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Tooltip,
  TextField,
  InputAdornment,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import StoreAdminSidebar from '../components/StoreAdminSidebar';
import axiosInstance from '../api/axiosInstance';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Tooltip as PieTooltip,
  Legend as PieLegend,
} from 'recharts';

const STATUS_COLORS = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'error',
  completed: 'info',
};

const PIE_COLORS = {
  pending: '#f0ad4e',
  confirmed: '#5cb85c',
  cancelled: '#d9534f',
  completed: '#5bc0de',
};

function getLastMonths(n) {
  const months = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d);
  }
  return months;
}

function formatMonth(dateObj) {
  const opts = { year: 'numeric', month: 'short' };
  return dateObj.toLocaleDateString(undefined, opts);
}

function monthKey(dateObj) {
  const y = dateObj.getFullYear();
  const m = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  return `${y}-${m}`;
}

function AppointmentManagement() {
  const sidebarWidth = 200;

  const [bookings, setBookings] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [currentMonthStatus, setCurrentMonthStatus] = useState({
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
  });
  const [totalStatusCounts, setTotalStatusCounts] = useState({
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingBooking, setDeletingBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/bookings');
      const data = res.data || [];
      setBookings(data);
      processChartData(data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to fetch bookings.');
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (bookingList) => {
    const months = getLastMonths(6);
    const data = months.map((monthDate) => ({
      monthLabel: formatMonth(monthDate),
      monthKey: monthKey(monthDate),
      pending: 0,
      confirmed: 0,
      cancelled: 0,
      completed: 0,
    }));

    const currentMonthKey = monthKey(new Date());
    const currentStatus = {
      pending: 0,
      confirmed: 0,
      cancelled: 0,
      completed: 0,
    };

    const totalCounts = {
      pending: 0,
      confirmed: 0,
      cancelled: 0,
      completed: 0,
    };

    bookingList.forEach((b) => {
      const dateStr = b.createdAt || b.updatedAt;
      if (!dateStr) return;
      const d = new Date(dateStr);
      const mKey = monthKey(d);
      const status = b.status;

      const idx = data.findIndex((entry) => entry.monthKey === mKey);
      if (idx >= 0 && status in data[idx]) {
        data[idx][status] = (data[idx][status] || 0) + 1;
      }

      if (mKey === currentMonthKey && status in currentStatus) {
        currentStatus[status] = (currentStatus[status] || 0) + 1;
      }

      if (status in totalCounts) {
        totalCounts[status]++;
      }
    });

    setChartData(data);
    setCurrentMonthStatus(currentStatus);
    setTotalStatusCounts(totalCounts);
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await axiosInstance.put(`/bookings/status/${bookingId}`, { status: newStatus });
      setSnackbar({ open: true, message: 'Status updated.', severity: 'success' });
      await fetchBookings();
    } catch (err) {
      console.error('Error updating status:', err);
      setSnackbar({ open: true, message: 'Failed to update status.', severity: 'error' });
    }
  };

  const handleDeleteBooking = async () => {
    try {
      await axiosInstance.delete(`/bookings/${deletingBooking._id}`);
      setSnackbar({ open: true, message: 'Booking deleted.', severity: 'success' });
      setDeleteDialogOpen(false);
      setDeletingBooking(null);
      await fetchBookings();
    } catch (err) {
      console.error('Error deleting booking:', err);
      setSnackbar({ open: true, message: 'Failed to delete booking.', severity: 'error' });
    }
  };

  const handleOpenDelete = (booking) => {
    setDeletingBooking(booking);
    setDeleteDialogOpen(true);
  };

  const handleCloseDelete = () => {
    setDeleteDialogOpen(false);
    setDeletingBooking(null);
  };

  const filteredBookings = useMemo(() => {
    if (!searchTerm.trim()) return bookings;
    return bookings.filter((b) =>
      b.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [bookings, searchTerm]);

  return (
    <Box sx={{ display: 'flex' }}>
      <StoreAdminSidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: { sm: `${sidebarWidth}px` },
          backgroundColor: '#f9fafb',
          minHeight: '100vh',
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Appointment Management
        </Typography>

        {/* Charts */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            mb: 4,
          }}
        >
          {/* Bar Chart */}
          <Box
            sx={{
              flex: 1,
              height: 350,
              backgroundColor: 'white',
              p: 3,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              },
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: '600' }}>
              Bookings by Status ‒ Last 6 Months
            </Typography>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="monthLabel" />
                  <YAxis allowDecimals={false} />
                  <ReTooltip />
                  <Legend />
                  <Bar dataKey="pending" stackId="a" fill={PIE_COLORS.pending} />
                  <Bar dataKey="confirmed" stackId="a" fill={PIE_COLORS.confirmed} />
                  <Bar dataKey="cancelled" stackId="a" fill={PIE_COLORS.cancelled} />
                  <Bar dataKey="completed" stackId="a" fill={PIE_COLORS.completed} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography>No bookings in last 6 months.</Typography>
            )}
          </Box>

          {/* Pie Chart */}
          <Box
            sx={{
              flex: 1,
              height: 350,
              backgroundColor: 'white',
              p: 3,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              },
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: '600' }}>
              Current Month Booking Status
            </Typography>
            {Object.values(currentMonthStatus).some((c) => c > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    dataKey="value"
                    isAnimationActive={false}
                    data={Object.entries(currentMonthStatus).map(([key, value]) => ({
                      name: key.charAt(0).toUpperCase() + key.slice(1),
                      value,
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {Object.keys(currentMonthStatus).map((key, idx) => (
                      <Cell key={`cell-${idx}`} fill={PIE_COLORS[key]} />
                    ))}
                  </Pie>
                  <PieTooltip />
                  <PieLegend verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Typography>No bookings this month.</Typography>
            )}
          </Box>
        </Box>

        {/* Total Appointment Counts by Status as Cards */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            mb: 4,
          }}
        >
          {Object.entries(totalStatusCounts).map(([status, count]) => (
            <Paper
              key={status}
              elevation={3}
              sx={{
                flex: '1 1 200px',
                minWidth: 180,
                px: 2,
                py: 2,
                borderLeft: `6px solid ${PIE_COLORS[status]}`,
                backgroundColor: '#fff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ color: '#777', textTransform: 'uppercase', fontWeight: 500 }}
              >
                {status}
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 'bold',
                  color: PIE_COLORS[status],
                  mt: 0.5,
                  textTransform: 'capitalize',
                }}
              >
                {count}
              </Typography>
            </Paper>
          ))}
        </Box>

        {/* Search */}
        <Box sx={{ mb: 2, maxWidth: 400 }}>
          <TextField
            label="Search by Client Name"
            variant="outlined"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Table */}
        {loading ? (
          <Typography>Loading appointments...</Typography>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : filteredBookings.length === 0 ? (
          <Alert severity="info">
            No appointments found{searchTerm ? ' matching your search.' : '.'}
          </Alert>
        ) : (
          <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Table stickyHeader>
              <TableHead sx={{ backgroundColor: '#1976d2' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: '600' }}>Trainer</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: '600' }}>Time Slot</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: '600' }}>Client</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: '600' }}>Contact</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: '600' }}>Status</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: '600' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBookings.map((booking) => {
                  const { _id, trainerId, slotId, clientName, clientContact, status } = booking;
                  const dayTime = slotId
                    ? `${slotId.day} ${slotId.startTime} - ${slotId.endTime}`
                    : 'N/A';
                  return (
                    <TableRow key={_id} hover sx={{ '&:hover': { backgroundColor: '#e3f2fd' } }}>
                      <TableCell>{trainerId?.name || 'N/A'}</TableCell>
                      <TableCell>{dayTime}</TableCell>
                      <TableCell>{clientName}</TableCell>
                      <TableCell>
                        {clientContact?.phone || 'N/A'}
                        <br />
                        {clientContact?.email || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={status}
                          size="small"
                          onChange={(e) => handleStatusChange(_id, e.target.value)}
                          sx={{ minWidth: 140 }}
                        >
                          {['pending', 'confirmed', 'cancelled', 'completed'].map((stat) => (
                            <MenuItem key={stat} value={stat}>
                              <Typography
                                sx={{
                                  color: PIE_COLORS[stat],
                                  fontWeight: '600',
                                  textTransform: 'capitalize',
                                }}
                              >
                                {stat}
                              </Typography>
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Delete Booking">
                          <IconButton color="error" onClick={() => handleOpenDelete(booking)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={handleCloseDelete}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            Are you sure you want to delete the booking for{' '}
            <strong>{deletingBooking?.clientName}</strong>?
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDelete} color="primary">
              Cancel
            </Button>
            <Button onClick={handleDeleteBooking} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar Notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}

export default AppointmentManagement;
