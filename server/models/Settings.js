const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  schoolName: { type: String, default: 'Shri Swami Narayana Vidhyalaya' },
  schoolAddress: { type: String, default: '' },
  principalName: { type: String, default: '' },
  logoUrl: { type: String, default: '' }
});

module.exports = mongoose.model('Settings', settingsSchema);
