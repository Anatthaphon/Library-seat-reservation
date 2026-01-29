const mongoose = require("mongoose");

const SeatMapItemSchema = new mongoose.Schema(
  {
    mapId: { type: String, default: "main", index: true },

    type: {
      type: String,
      required: true,
      enum: ["seat", "label", "block", "computer"],
      index: true,
    },

    seatId: { type: String, default: null, index: true },
    zone: { type: String, default: null }, 
    size: { type: String, default: "normal" }, // normal | tiny | fixed

    pos: {
      left: { type: Number, required: true },
      top: { type: Number, required: true },
    },

    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SeatMapItem", SeatMapItemSchema);
