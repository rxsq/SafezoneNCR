const express = require("express");
const router = express.Router();
const { Employee } = require("../db/models");
const paginate = require("../utils/paginate");
const { requireRole } = require("../utils/authz");

// GET all
router.get("/", async (req, res) => {
  try {
    res.json(await paginate(Employee, req));
  } catch {
    res.status(500).json({ status: "error", message: "DB error" });
  }
});

// GET by id
router.get("/:empID", async (req, res) => {
  const id = Number(req.params.empID);
  const row = await Employee.findByPk(id);
  if (!row)
    return res
      .status(404)
      .json({ status: "error", message: "Employee not found" });
  res.json(row);
});

// POST (Admin/Supervisor)
router.post(
  "/",
  requireRole(["Administrator", "Supervisor"]),
  async (req, res) => {
    const last = await Employee.findOne({ order: [["empID", "DESC"]] });
    const nextId = last ? last.empID + 1 : 1;
    const created = await Employee.create({ ...req.body, empID: nextId });
    res
      .status(201)
      .json({
        status: "success",
        message: "Employee added successfully",
        employee: created,
      });
  }
);

// PUT (Admin/Supervisor)
router.put(
  "/:empID",
  requireRole(["Administrator", "Supervisor"]),
  async (req, res) => {
    const id = Number(req.params.empID);
    const [affected] = await Employee.update(req.body, {
      where: { empID: id },
    });
    if (!affected)
      return res
        .status(404)
        .json({ status: "error", message: "Employee not found" });
    res.json({ status: "success", message: "Employee updated successfully" });
  }
);

// DELETE (Admin only)
router.delete("/:empID", requireRole(["Administrator"]), async (req, res) => {
  const id = Number(req.params.empID);
  const deleted = await Employee.destroy({ where: { empID: id } });
  if (!deleted)
    return res
      .status(404)
      .json({ status: "error", message: "Employee not found" });
  res.json({ status: "success", message: "Employee deleted successfully" });
});

module.exports = router;
