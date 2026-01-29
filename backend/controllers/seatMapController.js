const SeatMapItem = require("../models/SeatMapItem");

// GET: ทุกคนดูผังได้
exports.getMapItems = async (req, res) => {
  try {
    const mapId = req.query.mapId || "main";
    const items = await SeatMapItem.find({ mapId, isActive: true }).sort({ type: 1, seatId: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch seatmap items", error: err.message });
  }
};

// POST: admin เพิ่ม item
exports.createItem = async (req, res) => {
  try {
    const item = await SeatMapItem.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: "Failed to create item", error: err.message });
  }
};

// PUT: admin แก้ item (เช่นลากเปลี่ยนตำแหน่ง)
exports.updateItem = async (req, res) => {
  try {
    const updated = await SeatMapItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "Item not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Failed to update item", error: err.message });
  }
};

// DELETE: admin ลบ item
exports.deleteItem = async (req, res) => {
  try {
    const deleted = await SeatMapItem.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Deleted", id: req.params.id });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete item", error: err.message });
  }
};

// (ทางเลือก) PUT replace ทั้งผังทีเดียว (admin)
exports.replaceMap = async (req, res) => {
  try {
    const mapId = req.body.mapId || "main";
    const items = req.body.items || [];

    await SeatMapItem.deleteMany({ mapId });
    const created = await SeatMapItem.insertMany(items.map(i => ({ ...i, mapId })));

    res.json({ message: "Map replaced", count: created.length });
  } catch (err) {
    res.status(400).json({ message: "Failed to replace map", error: err.message });
  }
};
