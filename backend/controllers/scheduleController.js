const Schedule = require('../models/Schedule');

// Get all schedules
exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate('instructor', 'username email fullName')
      .sort({ date: 1, 'timeSlot.startTime': 1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get schedule by ID
exports.getScheduleById = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('instructor', 'username email fullName');
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new schedule
exports.createSchedule = async (req, res) => {
  try {
    const scheduleData = req.body;
    
    // Calculate day of week if not provided
    if (!scheduleData.dayOfWeek && scheduleData.date) {
      const date = new Date(scheduleData.date);
      scheduleData.dayOfWeek = date.getDay();
    }
    
    const schedule = new Schedule(scheduleData);
    await schedule.save();
    
    const populatedSchedule = await Schedule.findById(schedule._id)
      .populate('instructor', 'username email fullName');
    
    res.status(201).json(populatedSchedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update schedule
exports.updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('instructor', 'username email fullName');
    
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.json(schedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete schedule
exports.deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get schedules by date range
exports.getSchedulesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const schedules = await Schedule.find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    })
      .populate('instructor', 'username email fullName')
      .sort({ date: 1, 'timeSlot.startTime': 1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get schedules by week
exports.getSchedulesByWeek = async (req, res) => {
  try {
    const date = new Date(req.params.date);

    // Get start of week (Monday)
    const startOfWeek = new Date(date);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day; // If Sunday (0), go back 6 days to Monday
    startOfWeek.setDate(date.getDate() + diff);
    startOfWeek.setHours(0, 0, 0, 0);

    // Get end of week (Sunday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    const schedules = await Schedule.find({
      date: {
        $gte: startOfWeek,
        $lte: endOfWeek
      }
    })
      .populate('instructor', 'username email fullName')
      .sort({ dayOfWeek: 1, 'timeSlot.startTime': 1 });
    
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get schedules by instructor
exports.getSchedulesByInstructor = async (req, res) => {
  try {
    const schedules = await Schedule.find({ instructor: req.params.instructorId })
      .sort({ date: 1, 'timeSlot.startTime': 1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
