const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  courseCode: {
    type: String,
    trim: true
  },
  instructor: { 
    type: String, 
    required: false 
  },
  instructorName: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  dayOfWeek: {
    type: Number, // 0-6 (Sunday to Saturday)
    required: true
  },
  timeSlot: {
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    }
  },
  duration: {
    type: Number, // in hours
    default: 1
  },
  room: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    default: '#3b82f6' // Default blue color
  },
  type: {
    type: String,
    enum: ['lecture', 'lab', 'tutorial', 'exam', 'other'],
    default: 'lecture'
  },
  description: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  // For recurring events
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', null],
    default: null
  }
}, {
  timestamps: true
});

scheduleSchema.index({ date: 1, dayOfWeek: 1 });
scheduleSchema.index({ instructor: 1, date: 1 });

module.exports = mongoose.model('Schedule', scheduleSchema);
