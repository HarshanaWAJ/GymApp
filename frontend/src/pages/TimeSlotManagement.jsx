import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Grid,
} from '@mui/material';
import StoreAdminSidebar from '../components/StoreAdminSidebar';
import axiosInstance from '../api/axiosInstance';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function TimeSlotManagement() {
  const sidebarWidth = 200;
  const { trainerId } = useParams();

  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [openForm, setOpenForm] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [formData, setFormData] = useState({ day: '', startTime: '', endTime: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState(null);

  // Delete confirmation dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState(null);

  // Snackbar for feedback messages
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch time slots for the trainer
  const fetchTimeSlots = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get(`/timeslots/${trainerId}`);
      setTimeSlots(res.data);
    } catch (err) {
      setError('Failed to fetch time slots');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (trainerId) {
      fetchTimeSlots();
    }
  }, [trainerId]);

  // Validate form fields
  const validate = () => {
    let errors = {};
    if (!formData.day) errors.day = 'Day is required';
    if (!formData.startTime) errors.startTime = 'Start time is required';
    if (!formData.endTime) errors.endTime = 'End time is required';

    // Optional: Check if endTime is after startTime
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      errors.endTime = 'End time must be after start time';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear specific field error on change
    setFormErrors((prev) => ({
      ...prev,
      [name]: null,
    }));
  };

  const openAddForm = () => {
    setFormMode('add');
    setFormData({ day: '', startTime: '', endTime: '' });
    setFormErrors({});
    setEditingSlotId(null);
    setOpenForm(true);
  };

  const openEditForm = (slot) => {
    setFormMode('edit');
    setFormData({
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
    setFormErrors({});
    setEditingSlotId(slot._id);
    setOpenForm(true);
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (formMode === 'add') {
        await axiosInstance.post(`/timeslots/${trainerId}`, formData);
        setSnackbar({ open: true, message: 'Time slot added successfully', severity: 'success' });
      } else if (formMode === 'edit') {
        await axiosInstance.put(`/timeslots/slot/${editingSlotId}`, formData);
        setSnackbar({ open: true, message: 'Time slot updated successfully', severity: 'success' });
      }
      setOpenForm(false);
      fetchTimeSlots();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to save time slot', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete handlers
  const confirmDelete = (slot) => {
    setSlotToDelete(slot);
    setOpenDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!slotToDelete) return;

    setSubmitting(true);
    try {
      await axiosInstance.delete(`/timeslots/slot/${slotToDelete._id}`);
      setSnackbar({ open: true, message: 'Time slot deleted successfully', severity: 'success' });
      fetchTimeSlots();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete time slot', severity: 'error' });
    } finally {
      setOpenDeleteDialog(false);
      setSubmitting(false);
      setSlotToDelete(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
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
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
        }}
      >
        <Typography variant="h4" gutterBottom>
          Time Slot Management
        </Typography>

        <Button variant="contained" onClick={openAddForm} sx={{ mb: 3 }}>
          Add New Time Slot
        </Button>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : timeSlots.length === 0 ? (
          <Typography>No time slots found.</Typography>
        ) : (
          <Box>
            {timeSlots.map((slot) => (
              <Box
                key={slot._id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  bgcolor: 'white',
                  p: 2,
                  mb: 1,
                  borderRadius: 1,
                  boxShadow: 1,
                }}
              >
                <Typography variant="subtitle1">
                  <strong>{slot.day}</strong>: {slot.startTime} - {slot.endTime}
                </Typography>
                <Box>
                  <Button size="small" onClick={() => openEditForm(slot)} sx={{ mr: 1 }}>
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => confirmDelete(slot)}
                    disabled={submitting}
                  >
                    Delete
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {/* Add/Edit Time Slot Dialog */}
        <Dialog open={openForm} onClose={() => !submitting && setOpenForm(false)} fullWidth maxWidth="xs">
          <DialogTitle>{formMode === 'add' ? 'Add Time Slot' : 'Edit Time Slot'}</DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ mt: 1 }} noValidate autoComplete="off">
              <Select
                fullWidth
                name="day"
                value={formData.day}
                onChange={handleChange}
                displayEmpty
                error={Boolean(formErrors.day)}
                sx={{ mb: 2 }}
              >
                <MenuItem value="" disabled>
                  Select Day
                </MenuItem>
                {daysOfWeek.map((day) => (
                  <MenuItem key={day} value={day}>
                    {day}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.day && (
                <Typography color="error" variant="caption" sx={{ mb: 1, display: 'block' }}>
                  {formErrors.day}
                </Typography>
              )}

              <TextField
                label="Start Time"
                name="startTime"
                type="time"
                fullWidth
                value={formData.startTime}
                onChange={handleChange}
                error={Boolean(formErrors.startTime)}
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
              />
              {formErrors.startTime && (
                <Typography color="error" variant="caption" sx={{ mb: 1, display: 'block' }}>
                  {formErrors.startTime}
                </Typography>
              )}

              <TextField
                label="End Time"
                name="endTime"
                type="time"
                fullWidth
                value={formData.endTime}
                onChange={handleChange}
                error={Boolean(formErrors.endTime)}
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
              />
              {formErrors.endTime && (
                <Typography color="error" variant="caption" sx={{ mb: 1, display: 'block' }}>
                  {formErrors.endTime}
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => !submitting && setOpenForm(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={submitting}
              startIcon={submitting && <CircularProgress size={20} />}
            >
              {formMode === 'add' ? 'Add' : 'Update'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={openDeleteDialog} onClose={() => !submitting && setOpenDeleteDialog(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the time slot for{' '}
              <strong>{slotToDelete?.day}</strong> from <strong>{slotToDelete?.startTime}</strong> to{' '}
              <strong>{slotToDelete?.endTime}</strong>?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => !submitting && setOpenDeleteDialog(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              color="error"
              variant="contained"
              onClick={handleDelete}
              disabled={submitting}
              startIcon={submitting && <CircularProgress size={20} />}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for messages */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}

export default TimeSlotManagement;
