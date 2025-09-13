const express = require("express");
const router = express.Router();
const { Notification } = require("../db/models");
const { requireRole } = require("../utils/authz");

// add notification (any logged-in user)
router.post("/add", async (req, res) => {
  const { user_id, message, ncrFormID } = req.body;
  if (!user_id || !message)
    return res.status(400).json({ error: "User ID and message are required." });

  const last = await Notification.findOne({ order: [["id", "DESC"]] });
  const nextId = last ? last.id + 1 : 1;

  await Notification.create({
    id: nextId,
    ncrFormID: ncrFormID ?? null,
    user_id,
    message,
    status: "unread",
    created_at: new Date().toISOString(),
  });

  res.status(201).json({ message: "Notification added successfully." });
});

// get notifications for current user (ignore path param; enforce session)
router.get("/:userId", async (req, res) => {
  const me = req.session?.user?.empID;
  const reqId = Number(req.params.userId);
  if (
    me !== reqId &&
    !["Administrator", "Supervisor"].includes(req.session?.user?.role)
  ) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const items = await Notification.findAll({ where: { user_id: reqId } });
  res.json(items);
});

// mark as read (owner or admin/supervisor)
router.post("/read/:notificationId", async (req, res) => {
  const id = Number(req.params.notificationId);
  const me = req.session?.user?.empID;
  const notif = await Notification.findByPk(id);
  if (!notif) return res.status(404).json({ error: "Notification not found." });

  const can =
    notif.user_id === me ||
    ["Administrator", "Supervisor"].includes(req.session?.user?.role);
  if (!can) return res.status(403).json({ error: "Forbidden" });

  await Notification.update({ status: "read" }, { where: { id } });
  res.json({ message: "Notification marked as read." });
});

// delete (admin only)
router.delete(
  "/:notificationId",
  requireRole(["Administrator"]),
  async (req, res) => {
    const id = Number(req.params.notificationId);
    const deleted = await Notification.destroy({ where: { id } });
    if (!deleted)
      return res.status(404).json({ error: "Notification not found." });
    res.json({ message: "Notification deleted successfully." });
  }
);

module.exports = router;
