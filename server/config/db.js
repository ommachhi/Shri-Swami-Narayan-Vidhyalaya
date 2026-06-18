const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Auto-seed/reset default admin (query by username)
    try {
      let admin = await Admin.findOne({ username: 'admin' });
      if (!admin) {
        await Admin.create({
          username: 'admin',
          email: 'admin@ssnv.edu.in',
          passwordHash: 'password123'
        });
        console.log('Default admin seeded: admin@ssnv.edu.in / password123');
      } else {
        admin.passwordHash = 'password123';
        admin.email = 'admin@ssnv.edu.in';
        await admin.save();
        console.log('Default admin credentials verified/reset: admin / password123');
      }
    } catch (seedError) {
      console.warn('Seeding warning (non-fatal):', seedError.message);
    }
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
