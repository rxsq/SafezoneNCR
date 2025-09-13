const express = require("express");
const router = express.Router();
const { NcrPurchasingForm } = require("../db/models");
const { requireRole } = require("../utils/authz");

router.get("/", async (_req, res) => {
  try {
    res.json(await NcrPurchasingForm.findAll());
  } catch {
    res.status(500).json({ status: "error", message: "DB error" });
  }
});

router.get("/:purFormID", async (req, res) => {
  const id = Number(req.params.purFormID);
  const row = await NcrPurchasingForm.findByPk(id);
  if (!row)
    return res
      .status(404)
      .json({ status: "error", message: "Purchasing form not found" });
  res.json(row);
});

router.post(
  "/",
  requireRole(["Purchasing", "Administrator", "Supervisor"]),
  async (req, res) => {
    const last = await NcrPurchasingForm.findOne({
      order: [["purFormID", "DESC"]],
    });
    const nextId = last ? last.purFormID + 1 : 1;
    const created = await NcrPurchasingForm.create({
      ...req.body,
      purFormID: nextId,
    });
    res.status(201).json(created);
  }
);

router.put(
  "/:purFormID",
  requireRole(["Purchasing", "Administrator", "Supervisor"]),
  async (req, res) => {
    const id = Number(req.params.purFormID);
    const [affected] = await NcrPurchasingForm.update(req.body, {
      where: { purFormID: id },
    });
    if (!affected)
      return res
        .status(404)
        .json({ status: "error", message: "Purchasing form not found" });
    res.json({
      status: "success",
      message: "Purchasing form updated successfully",
    });
  }
);

router.delete(
  "/:purFormID",
  requireRole(["Administrator", "Supervisor"]),
  async (req, res) => {
    const id = Number(req.params.purFormID);
    const deleted = await NcrPurchasingForm.destroy({
      where: { purFormID: id },
    });
    if (!deleted)
      return res
        .status(404)
        .json({ status: "error", message: "Purchasing form not found" });
    res.json({
      status: "success",
      message: "Purchasing form deleted successfully",
    });
  }
);

module.exports = router;
