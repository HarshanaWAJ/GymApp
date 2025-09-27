import React, { useState } from 'react';
import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Stack,
  InputAdornment,
  IconButton,
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import CloseIcon from '@mui/icons-material/Close';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 420 },
  bgcolor: 'background.paper',
  borderRadius: 3,
  boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
  p: 5,
  outline: 'none',
  backdropFilter: 'blur(8px)',
};

export default function AddTrainerModal({ open, handleClose, onAdd }) {
  const [trainer, setTrainer] = useState({
    name: '',
    specialization: '',
    experience: '',
    available: true,
    contact: {
      phone: '',
      email: '',
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'phone' || name === 'email') {
      setTrainer((prev) => ({
        ...prev,
        contact: {
          ...prev.contact,
          [name]: value,
        },
      }));
    } else if (type === 'checkbox') {
      setTrainer((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setTrainer((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!trainer.name.trim()) return alert('Name is required');
    if (!trainer.specialization.trim()) return alert('Specialization is required');
    if (trainer.experience === '' || Number(trainer.experience) < 0)
      return alert('Experience must be 0 or more');

    onAdd(trainer);
    handleClose();
    setTrainer({
      name: '',
      specialization: '',
      experience: '',
      available: true,
      contact: {
        phone: '',
        email: '',
      },
    });
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="add-trainer-title"
      closeAfterTransition
      sx={{ backdropFilter: 'blur(6px)', backgroundColor: 'rgba(0,0,0,0.3)' }}
    >
      <Box sx={style} component="form" onSubmit={handleSubmit} noValidate>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="700" color="primary.dark">
            Add Trainer
          </Typography>
          <IconButton
            onClick={handleClose}
            sx={{
              color: 'grey.600',
              transition: 'color 0.3s',
              '&:hover': { color: 'primary.main' },
            }}
            aria-label="close modal"
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Stack spacing={3}>
          <TextField
            required
            name="name"
            label="Full Name"
            variant="outlined"
            fullWidth
            value={trainer.name}
            onChange={handleChange}
            placeholder="John Doe"
            InputProps={{
              sx: {
                borderRadius: 2,
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.07)',
                transition: 'all 0.3s ease',
                '&.Mui-focused': {
                  boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)',
                  borderColor: 'primary.main',
                },
              },
            }}
          />
          <TextField
            required
            name="specialization"
            label="Specialization"
            variant="outlined"
            fullWidth
            value={trainer.specialization}
            onChange={handleChange}
            placeholder="Yoga, Strength Training..."
            InputProps={{
              sx: {
                borderRadius: 2,
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.07)',
                transition: 'all 0.3s ease',
                '&.Mui-focused': {
                  boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)',
                },
              },
            }}
          />
          <TextField
            required
            name="experience"
            label="Experience (years)"
            variant="outlined"
            fullWidth
            type="number"
            value={trainer.experience}
            onChange={handleChange}
            inputProps={{ min: 0 }}
            placeholder="0"
            InputProps={{
              sx: {
                borderRadius: 2,
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.07)',
                transition: 'all 0.3s ease',
                '&.Mui-focused': {
                  boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)',
                },
              },
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={trainer.available}
                onChange={handleChange}
                name="available"
                color="primary"
                sx={{ p: 0 }}
              />
            }
            label="Available for new clients"
            sx={{ userSelect: 'none' }}
          />
          <TextField
            name="phone"
            label="Phone Number"
            variant="outlined"
            fullWidth
            value={trainer.contact.phone}
            onChange={handleChange}
            placeholder="+1 555 123 4567"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon color="action" />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.07)',
                transition: 'all 0.3s ease',
                '&.Mui-focused': {
                  boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)',
                },
              },
            }}
          />
          <TextField
            name="email"
            label="Email Address"
            variant="outlined"
            fullWidth
            value={trainer.contact.email}
            onChange={handleChange}
            placeholder="email@example.com"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.07)',
                transition: 'all 0.3s ease',
                '&.Mui-focused': {
                  boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)',
                },
              },
            }}
          />
        </Stack>

        <Box
          mt={5}
          display="flex"
          justifyContent="flex-end"
          gap={2}
        >
          <Button
            variant="outlined"
            onClick={handleClose}
            sx={{
              borderRadius: 3,
              paddingX: 3,
              fontWeight: 600,
              color: 'grey.700',
              borderColor: 'grey.400',
              transition: 'all 0.3s',
              '&:hover': {
                backgroundColor: 'grey.100',
                borderColor: 'primary.main',
                color: 'primary.main',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{
              borderRadius: 3,
              paddingX: 4,
              fontWeight: 700,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 6px 12px rgba(33, 203, 243, 0.6)',
              '&:hover': {
                background: 'linear-gradient(45deg, #21CBF3 30%, #2196F3 90%)',
                boxShadow: '0 8px 16px rgba(33, 203, 243, 0.8)',
              },
            }}
          >
            Add Trainer
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
