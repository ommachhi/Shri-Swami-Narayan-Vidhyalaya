const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const dns = require('dns');
dns.setDefaultResultOrder('ipv4first'); // Force IPv4 to fix Nodemailer ENETUNREACH on Railway

dotenv.config();

const app = express();
app.set('trust proxy', 1); // Fix express-rate-limit proxy warning

// Connect to database
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Smart Result Management System API is running...');
});

// Routes
app.use('/api/admin', require('./routes/admin'));
app.use('/api/otp', require('./routes/otp'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/result', require('./routes/result'));
app.use('/api/dashboard', require('./routes/dashboard'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
