import React, { useEffect, useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const sidebarWidth = 10;

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

  // --- PDF Export Handler (improved styling) ---
  const handleDownloadPdf = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text('Appointment Management Report', 14, 20);

    // Summary header
    doc.setFontSize(14);
    doc.setTextColor(60);
    doc.text('Total Appointment Counts by Status', 14, 30);

    const summaryData = Object.entries(totalStatusCounts).map(([status, count]) => [
      status.charAt(0).toUpperCase() + status.slice(1),
      count.toString(),
    ]);

    autoTable(doc, {
      startY: 34,
      head: [['Status', 'Count']],
      body: summaryData,
      theme: 'grid',
      styles: {
        halign: 'center',
        fontSize: 10,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [63, 81, 181], // Indigo-ish
        textColor: 255,
        fontStyle: 'bold',
      },
      bodyStyles: {
        textColor: 50,
      },
    });

    const summaryEndY = doc.lastAutoTable.finalY;

    // Bookings Table header
    const sectionHeaderY = summaryEndY + 10;
    doc.setFontSize(14);
    doc.setTextColor(60);
    doc.text('Bookings in Last 6 Months', 14, sectionHeaderY);

    const tableColumn = [
      'Trainer',
      'Time Slot',
      'Client',
      'Contact',
      'Status',
      'Booking Date',
    ];

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

    const filteredLast6Months = bookings.filter((b) => {
      const dateStr = b.createdAt || b.updatedAt;
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d >= new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth(), 1);
    });

    const tableRows = filteredLast6Months.map((b) => {
      const dayTime = b.slotId
        ? `${b.slotId.day} ${b.slotId.startTime} - ${b.slotId.endTime}`
        : 'N/A';

      const bookingDate = b.createdAt
        ? new Date(b.createdAt).toLocaleDateString()
        : 'N/A';

      // Combine phone & email
      const contact = [
        b.clientContact?.phone || '',
        b.clientContact?.email || '',
      ]
        .filter(Boolean)
        .join('\n');

      return [
        b.trainerId?.name || 'N/A',
        dayTime,
        b.clientName || '',
        contact,
        b.status.charAt(0).toUpperCase() + b.status.slice(1),
        bookingDate,
      ];
    });

    autoTable(doc, {
      startY: sectionHeaderY + 4,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      styles: {
        fontSize: 9,
        cellPadding: 3,
        valign: 'middle',
      },
      headStyles: {
        fillColor: [63, 81, 181],
        textColor: 255,
        fontStyle: 'bold',
      },
      bodyStyles: {
        textColor: 50,
      },
      columnStyles: {
        3: { cellWidth: 45 }, // Contact column
        1: { cellWidth: 30 }, // Time Slot
        0: { cellWidth: 30 }, // Trainer
      },
      didDrawPage: (data) => {
        // footer with generation date
        doc.setFontSize(10);
        doc.setTextColor(150);
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        doc.text(
          `Generated: ${new Date().toLocaleDateString()}`,
          14,
          pageHeight - 10
        );
      },
    });

    doc.save('Appointment_Report.pdf');
  };

  // Allowed status transitions according to your rules
  const getAllowedStatusOptions = (currentStatus) => {
    switch (currentStatus) {
      case 'pending':
        return ['pending', 'confirmed', 'cancelled', 'completed'];
      case 'confirmed':
        return ['confirmed', 'completed'];
      case 'cancelled':
        return ['cancelled']; // no change allowed
      case 'completed':
        return ['completed']; // no change allowed
      default:
        return ['pending', 'confirmed', 'cancelled', 'completed'];
    }
  };

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

        <Box sx={{ mb: 3 }}>
          <Button variant="contained" onClick={handleDownloadPdf}>
            Download Report as PDF
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
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

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 4 }}>
          <Box sx={{ flex: 1, height: 300, p: 2, borderRadius: 2, backgroundColor: '#fff', boxShadow: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold' }}>
              Appointments Status Over Last 6 Months
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="monthLabel" />
                <YAxis allowDecimals={false} />
                <ReTooltip />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="pending" stackId="a" fill={PIE_COLORS.pending} />
                <Bar dataKey="confirmed" stackId="a" fill={PIE_COLORS.confirmed} />
                <Bar dataKey="cancelled" stackId="a" fill={PIE_COLORS.cancelled} />
                <Bar dataKey="completed" stackId="a" fill={PIE_COLORS.completed} />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          <Box sx={{ flex: '0 0 320px', height: 300, p: 2, borderRadius: 2, backgroundColor: '#fff', boxShadow: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold' }}>
              Current Month Status Breakdown
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={Object.entries(currentMonthStatus).map(([status, count]) => ({
                    name: status,
                    value: count,
                  }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) =>
                    `${name.charAt(0).toUpperCase() + name.slice(1)}: ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {Object.entries(currentMonthStatus).map(([status]) => (
                    <Cell key={status} fill={PIE_COLORS[status]} />
                  ))}
                </Pie>
                <PieTooltip
                  formatter={(value, name) => [
                    value,
                    name.charAt(0).toUpperCase() + name.slice(1),
                  ]}
                />
                <PieLegend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        <Box sx={{ mb: 2, maxWidth: 400 }}>
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            placeholder="Search by client name..."
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

        <TableContainer component={Paper} sx={{ mb: 6 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Trainer</TableCell>
                <TableCell>Time Slot</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Booking Date</TableCell>
                <TableCell align="center" sx={{ minWidth: 120 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No bookings found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((booking) => {
                  const dayTime = booking.slotId
                    ? `${booking.slotId.day} ${booking.slotId.startTime} - ${booking.slotId.endTime}`
                    : 'N/A';

                  const bookingDate = booking.createdAt
                    ? new Date(booking.createdAt).toLocaleDateString()
                    : 'N/A';

                  const allowedStatusOptions = getAllowedStatusOptions(booking.status);

                  return (
                    <TableRow key={booking._id} hover>
                      <TableCell>{booking.trainerId?.name || 'N/A'}</TableCell>
                      <TableCell>{dayTime}</TableCell>
                      <TableCell>{booking.clientName}</TableCell>
                      <TableCell>
                        {booking.clientContact?.phone}
                        <br />
                        {booking.clientContact?.email}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={booking.status}
                          size="small"
                          onChange={(e) => {
                            const newStatus = e.target.value;
                            if (newStatus !== booking.status) {
                              handleStatusChange(booking._id, newStatus);
                            }
                          }}
                          disabled={allowedStatusOptions.length === 1}
                        >
                          {allowedStatusOptions.map((statusOption) => (
                            <MenuItem key={statusOption} value={statusOption}>
                              {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>{bookingDate}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Delete Booking">
                          <IconButton
                            color="error"
                            onClick={() => handleOpenDelete(booking)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={deleteDialogOpen} onClose={handleCloseDelete}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            Are you sure you want to delete the booking for{' '}
            <strong>{deletingBooking?.clientName}</strong>?
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDelete}>Cancel</Button>
            <Button color="error" onClick={handleDeleteBooking}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

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
