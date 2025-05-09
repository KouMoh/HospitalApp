const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
  uid: {
    type: String,
    unique: true,
    sparse: true // Only enforce uniqueness when present (for Level-1)
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: mongoose.Schema.Types.Mixed, // Accepts objects for Level-1 forms
    required: true
  },
  level: {
    type: Number,
    required: true,
    enum: [1, 2, 3] // Restrict levels to 1, 2, or 3
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastEditableDate: {
    type: Date,
    default: function() {
      // Set editable period to 24 hours after creation
      const date = new Date(this.createdAt);
      date.setHours(date.getHours() + 24);
      return date;
    }
  },
  createdBy: {
    type: String,
    required: true
  },
  lastModifiedBy: {
    type: String
  },
  lastModifiedAt: {
    type: Date
  }
});

// Add method to check if form is still editable
formSchema.methods.isEditable = function(username) {
  // Check if user is the creator and within editable period
  return this.createdBy === username && new Date() < this.lastEditableDate;
};

module.exports = mongoose.model('Form', formSchema);
