const express = require('express');
const router = express.Router();
const trainerController = require('../controllers/trainerController');

// CRUD Routes
router.get('/', trainerController.getAllTrainers);
router.get('/:id', trainerController.getTrainerById);
router.post('/add-trainer', trainerController.createTrainer);
router.put('/update-trainer/:id', trainerController.updateTrainer);
router.delete('/delete-trainer/:id', trainerController.deleteTrainer);

module.exports = router;
