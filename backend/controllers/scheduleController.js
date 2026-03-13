const mongoose = require("mongoose");
const Schedule = require('../models/Schedule');

// Get all schedules
exports.getAllSchedules = async (req, res) => {
  try {

    const userId = req.query.userId;

    let query = {};

    if (userId) {
      query.userId = userId;
    }

    const schedules = await Schedule.find(query)
      .populate('userId', 'studentId name surname email')
      .sort({ date: 1, 'timeSlot.startTime': 1 });

    res.json(schedules);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get schedule by ID
exports.getScheduleById = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate("userId", "studentId name surname email")
      .sort({ date: 1, "timeSlot.startTime": 1 });
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

    console.log("REQ BODY:", req.body);

    const data = req.body;

    if (!data.userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    if (!data.dayOfWeek && data.date) {
      const date = new Date(data.date);
      data.dayOfWeek = date.getDay();
    }

    const schedule = new Schedule({
      userId: data.userId,
      title: data.title,
      notes: data.notes,
      date: new Date(data.date),
      dayOfWeek: data.dayOfWeek,
      timeSlot: data.timeSlot,
      duration: data.duration,
      color: data.color,
      type: data.type,
      status: data.status
    });

    await schedule.save();

    res.status(201).json(schedule);

  } catch (error) {
    console.error("CREATE ERROR:", error);
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
      .populate('userId', 'username email fullName');
    
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
    /* realtime */
    req.app.get("io").emit("schedule-updated");

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
      .populate('userId', 'username email fullName')
      .sort({ date: 1, 'timeSlot.startTime': 1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get schedules by week
exports.getSchedulesByWeek = async (req, res) => {
  try {

    const userId = req.query.userId;   // ⭐ เพิ่ม

    const date = new Date(req.params.date);

    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = day === 0 ? -6 : 1 - day;

    startOfWeek.setDate(startOfWeek.getDate() + diff);
    startOfWeek.setHours(0,0,0,0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23,59,59,999);

    const schedules = await Schedule.find({
      userId: userId,        // ⭐ filter เฉพาะ user นี้
      date:{
        $gte:startOfWeek,
        $lte:endOfWeek
      }
    }).sort({ date:1 });

    res.json(schedules);

  } catch (error) {
    console.error("WEEK ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get schedules by instructor
exports.getSchedulesByInstructor = async (req, res) => {
  try {

    const schedules = await Schedule.find({
      userId: req.params.instructorId
    }).sort({ date: 1, "timeSlot.startTime": 1 });

    res.json(schedules);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReservations = async (req, res) => {
  try {

    const userId = req.query.userId;

    const schedules = await Schedule.find({
      type: "reservation",
      userId: userId
    }).sort({ date: 1 });

    res.json(schedules);

  } catch (error) {
    console.error("RESERVATION ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.createBulkSchedules = async (req, res) => {
  try {

    console.log("BODY:", JSON.stringify(req.body, null, 2));

    const { bookings } = req.body;

    if (!Array.isArray(bookings) || bookings.length === 0) {
      return res.status(400).json({ error: "bookings must be non-empty array" });
    }

    const docs = [];

    for (const b of bookings) {

      if (!b.date || !b.startTime || !b.endTime) {
        throw new Error("Missing required booking fields");
      }

      const seatId = b.room || b.seatItemId || b.seatId;

      if (!seatId) {
        throw new Error("Seat ID missing");
      }

      const startHour = parseInt(String(b.startTime).split(":")[0]);
      const endHour = parseInt(String(b.endTime).split(":")[0]);

      const date = new Date(b.date);

      // ⭐ ตรวจสอบการจองชนกัน
      const conflicts = await Schedule.find({
        seatItemId: seatId,
        date: date,
        type: "reservation"
      });

      for (const c of conflicts) {

        const existingStart = parseInt(c.timeSlot.startTime);
        const existingEnd = parseInt(c.timeSlot.endTime);

        const overlap =
          startHour < existingEnd &&
          endHour > existingStart;

        if (overlap) {
          return res.status(409).json({
            error: "Seat already reserved in this time slot"
          });
        }
      }

      docs.push({
        userId: b.userId,

        title: b.subject || "Seat Reservation",

        date: date,

        dayOfWeek: date.getDay(),

        timeSlot: {
          startTime: String(b.startTime),
          endTime: String(b.endTime)
        },

        duration: endHour - startHour,

        seatItemId: seatId,
        seatName:b.seatName,   

        type: "reservation",

        status: "reserved"
      });

    }

    const created = await Schedule.insertMany(docs);

    req.app.get("io").emit("schedule-updated", created);

    res.status(201).json(created);

  } catch (err) {

    console.error("BULK CREATE ERROR:", err);

    res.status(500).json({ error: err.message });

  }
};



