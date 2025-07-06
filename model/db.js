const mongoose = require('mongoose');

const uri = 'mongodb+srv://admin:mc0-admin@cluster0.ndwtzr5.mongodb.net/lab_res_db?retryWrites=true&w=majority&appName=Cluster0';

const connectDB = async () => {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB!');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
