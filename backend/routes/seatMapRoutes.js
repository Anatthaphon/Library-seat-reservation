const express = require("express");
const router = express.Router();
const SeatMapItem = require("../models/SeatMapItem");

// ✅ demo guard: admin เท่านั้น (ดูจาก header x-role)
function requireAdmin(req, res, next) {
  const role = req.header("x-role");
  if (role !== "admin") return res.status(403).json({ message: "Admin only" });
  next();
}

// 1) GET โหลดแผนผัง
router.get("/items", async (req, res, next) => {
  try {
    const mapId = req.query.mapId || "main";
    const items = await SeatMapItem.find({ mapId, isActive: true }).sort({ createdAt: 1 });
    res.json(items);
  } catch (e) {
    next(e);
  }
});

// 2) POST เพิ่ม item (admin เท่านั้น)
router.post("/items", requireAdmin, async (req, res, next) => {
  try {
    const doc = await SeatMapItem.create(req.body);
    res.status(201).json(doc);
  } catch (e) {
    next(e);
  }
});

// 3) PATCH แก้ไข item (ย้ายตำแหน่ง/เปลี่ยนค่า) (admin เท่านั้น)
router.patch("/items/:id", requireAdmin, async (req, res, next) => {
  try {
    const updated = await SeatMapItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

// 4) DELETE ลบ item (admin เท่านั้น)
router.delete("/items/:id", requireAdmin, async (req, res, next) => {
  try {
    await SeatMapItem.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;