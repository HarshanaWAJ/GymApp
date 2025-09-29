import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import StoreAdminSidebar from '../components/StoreAdminSidebar';
import axiosInstance from '../api/axiosInstance';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import AddTrainerModal from './forms/AddTrainerModal';
import UpdateTrainerModal from './forms/UpdateTrainerModal';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ScheduleIcon from '@mui/icons-material/Schedule';

function TrainerManagement() {
  const sidebarWidth = 10;
  const navigate = useNavigate();

  const [trainers, setTrainers] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterAvailability, setFilterAvailability] = useState('all');
  const [groupBy, setGroupBy] = useState('none');

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      const response = await axiosInstance.get('/trainers');
      setTrainers(response.data);
    } catch (error) {
      console.error('Error fetching trainers:', error);
    }
  };

  const handleAddTrainer = async (trainerData) => {
    try {
      await axiosInstance.post('/trainers/add-trainer', trainerData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchTrainers();
    } catch (error) {
      console.error('Error adding trainer:', error);
    }
  };

  const handleUpdateTrainer = async (trainerData, id) => {
    try {
      await axiosInstance.put(`/trainers/update-trainer/${id}`, trainerData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchTrainers();
    } catch (error) {
      console.error('Error updating trainer:', error);
    }
  };

  const handleDeleteTrainer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trainer?')) return;

    try {
      await axiosInstance.delete(`/trainers/delete-trainer/${id}`);
      fetchTrainers();
    } catch (error) {
      console.error('Error deleting trainer:', error);
    }
  };

  const filteredTrainers = useMemo(() => {
    return trainers
      .filter((trainer) => {
        if (filterAvailability === 'available') return trainer.available === true;
        if (filterAvailability === 'not_available') return trainer.available === false;
        return true;
      })
      .filter((trainer) => {
        const lowerTerm = searchTerm.toLowerCase();
        return (
          trainer.name.toLowerCase().includes(lowerTerm) ||
          trainer.specialization.toLowerCase().includes(lowerTerm) ||
          (trainer.contact?.phone?.toLowerCase().includes(lowerTerm) ?? false) ||
          (trainer.contact?.email?.toLowerCase().includes(lowerTerm) ?? false)
        );
      });
  }, [trainers, filterAvailability, searchTerm]);

  const groupedTrainers = useMemo(() => {
    if (groupBy === 'none') return { all: filteredTrainers };

    return filteredTrainers.reduce((groups, trainer) => {
      let key = '';
      if (groupBy === 'specialization') key = trainer.specialization || 'Others';
      else if (groupBy === 'available') key = trainer.available ? 'Available' : 'Not Available';
      else key = 'Others';

      if (!groups[key]) groups[key] = [];
      groups[key].push(trainer);

      return groups;
    }, {});
  }, [filteredTrainers, groupBy]);

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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">Trainer Management</Typography>
          <Button variant="contained" onClick={() => setAddModalOpen(true)}>
            Add Trainer
          </Button>
        </Box>

        <Box display="flex" alignItems="center" gap={2} mb={3} flexWrap="wrap">
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 250 }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter Availability</InputLabel>
            <Select
              value={filterAvailability}
              label="Filter Availability"
              onChange={(e) => setFilterAvailability(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="available">Available</MenuItem>
              <MenuItem value="not_available">Not Available</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Group By</InputLabel>
            <Select value={groupBy} label="Group By" onChange={(e) => setGroupBy(e.target.value)}>
              <MenuItem value="none">None</MenuItem>
              <MenuItem value="specialization">Specialization</MenuItem>
              <MenuItem value="available">Availability</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {Object.entries(groupedTrainers).map(([group, trainersInGroup]) => (
          <Box key={group} mb={4}>
            {groupBy !== 'none' && (
              <Typography variant="h6" sx={{ mb: 1 }}>
                {group} ({trainersInGroup.length})
              </Typography>
            )}

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Image</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Specialization</TableCell>
                    <TableCell>Experience (years)</TableCell>
                    <TableCell>Available</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trainersInGroup.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No trainers found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    trainersInGroup.map((trainer) => (
                      <TableRow key={trainer._id}>
                        <TableCell>
                          {trainer.imageUrl ? (
                            <img
                              src={trainer.imageUrl}
                              alt={trainer.name}
                              style={{ width: 50, height: 50, borderRadius: '50%' }}
                            />
                          ) : (
                            'No Image'
                          )}
                        </TableCell>
                        <TableCell>{trainer.name}</TableCell>
                        <TableCell>{trainer.specialization}</TableCell>
                        <TableCell>{trainer.experience}</TableCell>
                        <TableCell>{trainer.available ? 'Yes' : 'No'}</TableCell>
                        <TableCell>
                          {trainer.contact?.phone} <br />
                          {trainer.contact?.email}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => {
                              setSelectedTrainer(trainer);
                              setUpdateModalOpen(true);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton color="error" onClick={() => handleDeleteTrainer(trainer._id)}>
                            <DeleteIcon />
                          </IconButton>
                          <IconButton
                            color="info"
                            onClick={() => navigate(`/admin-timeslot-management/${trainer._id}`)}
                            title="Manage Time Slots"
                          >
                            <ScheduleIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))}

        <AddTrainerModal
          open={addModalOpen}
          handleClose={() => setAddModalOpen(false)}
          onAdd={handleAddTrainer}
        />

        <UpdateTrainerModal
          open={updateModalOpen}
          handleClose={() => setUpdateModalOpen(false)}
          trainerData={selectedTrainer}
          onUpdate={handleUpdateTrainer}
        />
      </Box>
    </Box>
  );
}

export default TrainerManagement;
