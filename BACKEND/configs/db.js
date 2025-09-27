const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
// This module exports a function to connect to MongoDB using Mongoose.
// It uses an async function to handle the connection and logs success or error messages.
// Make sure to set the MONGO_URI environment variable before running the application.
// You can use this function in your main application file to establish the database connection.