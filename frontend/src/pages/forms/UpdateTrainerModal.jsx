import React, { useState, useEffect } from 'react';
import { Modal, Box, TextField, Button, Typography, Checkbox, FormControlLabel } from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 1,
  boxShadow: 24,
  p: 4,
};

export default function UpdateTrainerModal({ open, handleClose, trainerData, onUpdate }) {
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

  useEffect(() => {
    if (trainerData) {
      setTrainer({
        name: trainerData.name || '',
        specialization: trainerData.specialization || '',
        experience: trainerData.experience || '',
        available: trainerData.available ?? true,
        contact: {
          phone: trainerData.contact?.phone || '',
          email: trainerData.contact?.email || '',
        },
      });
    }
  }, [trainerData]);

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
    onUpdate(trainer);
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style} component="form" onSubmit={handleSubmit} noValidate>
        <Typography variant="h6" mb={2}>Update Trainer</Typography>
        <TextField
          required
          fullWidth
          label="Name"
          name="name"
          value={trainer.name}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          required
          fullWidth
          label="Specialization"
          name="specialization"
          value={trainer.specialization}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          required
          fullWidth
          label="Experience (years)"
          name="experience"
          type="number"
          value={trainer.experience}
          onChange={handleChange}
          margin="normal"
          inputProps={{ min: 0 }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={trainer.available}
              onChange={handleChange}
              name="available"
            />
          }
          label="Available"
        />
        <TextField
          fullWidth
          label="Phone"
          name="phone"
          value={trainer.contact.phone}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={trainer.contact.email}
          onChange={handleChange}
          margin="normal"
        />
        <Box mt={2} textAlign="right">
          <Button variant="contained" type="submit">Update</Button>
        </Box>
      </Box>
    </Modal>
  );
}
