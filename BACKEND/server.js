// Server File
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Import routes
const productRoutes = require('./routes/productRoute');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const paymentRoutes = require('./routes/paymentRoute');
const trainerRoutes = require('./routes/trainerRoutes');
const timeSlotRoutes = require('./routes/timeSlotRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

// Import the connectDB function from db.js
const connectDB = require('./configs/db'); 

dotenv.config();

connectDB(); // Connect to MongoDB using the connectDB function from db.js

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes) // Use the Auth Routes
app.use('/api/products', productRoutes); // Use the product routes
app.use('/api/cart', cartRoutes); // Use the Cart routes
app.use('/api/payment', paymentRoutes); // Use the Payment routes
app.use('/api/trainers', trainerRoutes); // Use the Trainer routes
app.use('/api/timeslots', timeSlotRoutes); // Use the TimeSlot routes
app.use('/api/bookings', bookingRoutes); // Use the Booking routes
app.use('/api/reviews', reviewRoutes); // Use the Review routes

// Server Run 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

