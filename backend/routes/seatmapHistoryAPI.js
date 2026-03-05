const express = require("express");
const router = express.Router();
const SeatMapHistory = require("../models/SeatMapHistoryModels");

/* SAVE HISTORY */
router.post("/", async (req, res) => {
  try {

    const history = new SeatMapHistory({
      adminName: req.body.adminName,
      actionType: req.body.actionType,
      seatId: req.body.seatId,
      before: req.body.before,
      after: req.body.after,
      createdAt: new Date()
    });

    await history.save();

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* GET HISTORY */
router.get("/", async (req, res) => {

  const logs = await SeatMapHistory.find()
    .sort({ createdAt: -1 });

  res.json(logs);

});

module.exports = router;