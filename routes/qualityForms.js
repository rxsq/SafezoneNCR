const express = require("express");
const router = express.Router();
const { NcrQualityForm } = require("../db/models");
const { requireRole } = require("../utils/authz");

router.get("/", async (_req, res) => {
  try {
    res.json(await NcrQualityForm.findAll());
  } catch {
    res.status(500).json({ status: "error", message: "DB error" });
  }
});

router.get("/:qualFormID", async (req, res) => {
  const id = Number(req.params.qualFormID);
  const row = await NcrQualityForm.findByPk(id);
  if (!row)
    return res
      .status(404)
      .json({ status: "error", message: "Quality form not found" });
  res.json(row);
});

router.post(
  "/",
  requireRole(["Inspector", "Administrator", "Supervisor"]),
  async (req, res) => {
    const last = await NcrQualityForm.findOne({
      order: [["qualFormID", "DESC"]],
    });
    const nextId = last ? last.qualFormID + 1 : 1;
    const created = await NcrQualityForm.create({
      ...req.body,
      qualFormID: nextId,
    });
    res
      .status(201)
      .json({ message: "Quality form created successfully", data: created });
  }
);

router.put(
  "/:qualFormID",
  requireRole(["Inspector", "Administrator", "Supervisor"]),
  async (req, res) => {
    const id = Number(req.params.qualFormID);
    const [affected] = await NcrQualityForm.update(req.body, {
      where: { qualFormID: id },
    });
    if (!affected)
      return res
        .status(404)
        .json({ status: "error", message: "Quality form not found" });
    res.json({
      status: "success",
      message: "Quality form updated successfully",
    });
  }
);

router.delete(
  "/:qualFormID",
  requireRole(["Administrator", "Supervisor"]),
  async (req, res) => {
    const id = Number(req.params.qualFormID);
    const deleted = await NcrQualityForm.destroy({ where: { qualFormID: id } });
    if (!deleted)
      return res
        .status(404)
        .json({ status: "error", message: "Quality form not found" });
    res.json({
      status: "success",
      message: "Quality form deleted successfully",
    });
  }
);

module.exports = router;
