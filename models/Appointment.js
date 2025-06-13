const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientUid: { type: String, required: true }, // Level-1 UID
  patientName: { type: String, required: true },
  doctor: { type: String, required: true },
  date: { type: Date, required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  cancelled: { type: Boolean, default: false }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
