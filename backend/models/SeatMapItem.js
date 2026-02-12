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


    zone: { type: String, default: null },
    size: { type: String, default: "normal" },

    pos: {
      left: { type: Number, required: true },
      top: { type: Number, required: true },
    },

    // ✅ บังคับ meta structure
    meta: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SeatMapItem", SeatMapItemSchema);
