const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');

// Get all schedules
router.get('/', scheduleController.getAllSchedules);

// Get schedule by ID
router.get('/:id', scheduleController.getScheduleById);

// Create new schedule/event
router.post('/', scheduleController.createSchedule);

// Update schedule
router.put('/:id', scheduleController.updateSchedule);

// Delete schedule
router.delete('/:id', scheduleController.deleteSchedule);

// Get schedules by date range
router.get('/range/:startDate/:endDate', scheduleController.getSchedulesByDateRange);

// Get schedules by week
router.get('/week/:date', scheduleController.getSchedulesByWeek);

// Get schedules by instructor
router.get('/instructor/:instructorId', scheduleController.getSchedulesByInstructor);

module.exports = router;
