const mongoose = require("mongoose");

const SeatMapHistorySchema = new mongoose.Schema({

  adminName: String,
  actionType: String,
  seatId: String,
  seatName: String,   // ⭐ เพิ่มบรรทัดนี้
  before: String,
  after: String,

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model(
  "SeatMapHistory",
  SeatMapHistorySchema
);