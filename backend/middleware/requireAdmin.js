module.exports = function requireAdmin(req, res, next) {
  // MVP: ใช้ header ตรวจ role ก่อน (ค่อยเปลี่ยนเป็น JWT ในอนาคต)
  const role = req.headers["x-role"];

  if (role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
};
