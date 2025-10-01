const Booking = require('../models/bookingModel');
const TimeSlot = require('../models/timeSlotModel');
const Trainer = require('../models/trainerModel');
const sendEmail = require('../helpers/emailSend');

// Book a trainer's available time slot
exports.bookTrainer = async (req, res) => {
  const { trainerId, slotId } = req.params;
  const { clientName, clientContact, date } = req.body;  // <-- Added date here

  if (!clientName || !date) {
    return res.status(400).json({ message: 'clientName and date are required' });
  }

  try {
    // Check if time slot exists for the trainer
    const slot = await TimeSlot.findOne({ _id: slotId, trainerId });
    if (!slot) return res.status(404).json({ message: 'Time slot not found for trainer' });

    // Check if already booked
    const existingBooking = await Booking.findOne({ slotId, status: { $ne: 'cancelled' } });
    if (existingBooking) return res.status(409).json({ message: 'Time slot already booked' });

    // Create booking
    const booking = new Booking({
      trainerId,
      slotId,
      clientName,
      clientContact,
      date,
    });

    const savedBooking = await booking.save();
    res.status(201).json(savedBooking);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('trainerId')
      .populate('slotId');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get bookings for a specific trainer
exports.getTrainerBookings = async (req, res) => {
  try {
    const trainerId = req.params.trainerId;
    const bookings = await Booking.find({ trainerId })
      .populate('slotId');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  const { bookingId } = req.params;
  const { status } = req.body;

  // Only allow specific statuses
  const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid booking status' });
  }

  try {
    // Find and update booking
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    )
    .populate('trainerId')
    .populate('slotId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // If client email exists, send email
    const clientEmail = booking.clientContact?.email;
    if (clientEmail) {
      const trainerName = booking.trainerId?.name || 'your trainer';
      const slotTime = booking.slotId?.time || 'scheduled time';
      const formattedDate = booking.date ? new Date(booking.date).toDateString() : 'Unknown date';

      await sendEmail({
        to: clientEmail,
        subject: 'Booking Status Updated',
        text: `Hello ${booking.clientName}, your booking status has been updated to: ${status}.`,
        html: `
          <p>Dear ${booking.clientName},</p>
          <p>Your booking with <strong>${trainerName}</strong> has been updated.</p>
          <p><strong>Status:</strong> ${status}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${slotTime}</p>
          <br />
          <p>Thank you for using our service!</p>
        `,
      });
    }

    res.json({ message: 'Booking status updated and email sent', booking });

  } catch (err) {
    console.error('Error updating booking or sending email:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete a booking
exports.deleteBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    await booking.deleteOne();
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Update booking details (without affecting status)
exports.rescheduleBooking = async (req, res) => {
  const { bookingId } = req.params;
  const { date, slotId } = req.body;

  try {
    if (!date && !slotId) {
      return res.status(400).json({ message: 'Provide new date or slotId to reschedule' });
    }

    const update = {};
    if (date) update.date = date;
    if (slotId) update.slotId = slotId;

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      update,
      { new: true }
    ).populate('trainerId').populate('slotId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ message: 'Booking rescheduled successfully', booking });

  } catch (err) {
    console.error('Error rescheduling booking:', err);
    res.status(500).json({ error: err.message });
  }
};
