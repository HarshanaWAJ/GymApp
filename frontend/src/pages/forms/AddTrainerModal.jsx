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
};

export default function AddTrainerModal({ open, handleClose, onAdd }) {
  const [trainer, setTrainer] = useState({
    name: '',
    specialization: '',
    experience: '',
    available: true,
    contact: { phone: '', email: '' },
    image: null,
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (files && files.length > 0) {
      setTrainer((prev) => ({ ...prev, image: files[0] }));
    } else if (name === 'phone' || name === 'email') {
      setTrainer((prev) => ({
        ...prev,
        contact: { ...prev.contact, [name]: value },
      }));
    } else if (type === 'checkbox') {
      setTrainer((prev) => ({ ...prev, [name]: checked }));
    } else {
      setTrainer((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', trainer.name);
    formData.append('specialization', trainer.specialization);
    formData.append('experience', trainer.experience);
    formData.append('available', trainer.available);
    formData.append('phone', trainer.contact.phone);
    formData.append('email', trainer.contact.email);
    if (trainer.image) {
      formData.append('image', trainer.image);
    }
    onAdd(formData);
    handleClose();
    setTrainer({
      name: '',
      specialization: '',
      experience: '',
      available: true,
      contact: { phone: '', email: '' },
      image: null,
    });
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style} component="form" onSubmit={handleSubmit} noValidate>
        <Box display="flex" justifyContent="space-between" mb={3}>
          <Typography variant="h4">Add Trainer</Typography>
          <IconButton onClick={handleClose}><CloseIcon /></IconButton>
        </Box>
        <Stack spacing={2}>
          <TextField name="name" label="Full Name" fullWidth required value={trainer.name} onChange={handleChange}/>
          <TextField name="specialization" label="Specialization" fullWidth required value={trainer.specialization} onChange={handleChange}/>
          <TextField name="experience" label="Experience (years)" type="number" fullWidth required value={trainer.experience} onChange={handleChange}/>
          <FormControlLabel control={<Checkbox checked={trainer.available} name="available" onChange={handleChange}/>} label="Available"/>
          <TextField name="phone" label="Phone" fullWidth value={trainer.contact.phone} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon/></InputAdornment>}}/>
          <TextField name="email" label="Email" fullWidth value={trainer.contact.email} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon/></InputAdornment>}}/>
          <Button variant="outlined" component="label">
            Upload Image
            <input type="file" hidden accept="image/*" onChange={handleChange}/>
          </Button>
        </Stack>
        <Box mt={3} textAlign="right">
          <Button variant="contained" type="submit">Add Trainer</Button>
        </Box>
      </Box>
    </Modal>
  );
}
