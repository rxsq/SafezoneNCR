const express = require("express");
const router = express.Router();
const { NcrEngineerForm } = require("../db/models");
const { requireRole } = require("../utils/authz");

router.get("/", async (_req, res) => {
  try {
    res.json(await NcrEngineerForm.findAll());
  } catch {
    res.status(500).json({ status: "error", message: "DB error" });
  }
});

router.get("/:engFormID", async (req, res) => {
  const id = Number(req.params.engFormID);
  const row = await NcrEngineerForm.findByPk(id);
  if (!row)
    return res
      .status(404)
      .json({ status: "error", message: "Engineering form not found" });
  res.json(row);
});

router.post(
  "/",
  requireRole(["Engineer", "Administrator", "Supervisor"]),
  async (req, res) => {
    const last = await NcrEngineerForm.findOne({
      order: [["engFormID", "DESC"]],
    });
    const nextId = last ? last.engFormID + 1 : 1;
    await NcrEngineerForm.create({ ...req.body, engFormID: nextId });
    res
      .status(201)
      .json({
        engFormID: nextId,
        message: "Engineering form created successfully",
      });
  }
);

router.put(
  "/:engFormID",
  requireRole(["Engineer", "Administrator", "Supervisor"]),
  async (req, res) => {
    const id = Number(req.params.engFormID);
    const [affected] = await NcrEngineerForm.update(req.body, {
      where: { engFormID: id },
    });
    if (!affected)
      return res
        .status(404)
        .json({ status: "error", message: "Engineering form not found" });
    res.json({
      status: "success",
      message: "Engineering form updated successfully",
    });
  }
);

router.delete(
  "/:engFormID",
  requireRole(["Administrator", "Supervisor"]),
  async (req, res) => {
    const id = Number(req.params.engFormID);
    const deleted = await NcrEngineerForm.destroy({ where: { engFormID: id } });
    if (!deleted)
      return res
        .status(404)
        .json({ status: "error", message: "Engineering form not found" });
    res.json({
      status: "success",
      message: "Engineering form deleted successfully",
    });
  }
);

module.exports = router;
