const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const error_logSchema = new Schema({
  message: { type: String, required: true },
  stack: { type: String },
  name: { type: String },
  source: { type: String },
  level: { type: String, enum: ['info', 'warn', 'error'], default: 'error' },
  timestamp: { type: Date, default: Date.now },
  metadata: { type: mongoose.Schema.Types.Mixed }
});

module.exports = mongoose.model('error_log', error_logSchema);