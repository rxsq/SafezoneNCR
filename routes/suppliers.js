const express = require("express");
const router = express.Router();
const { Supplier } = require("../db/models");
const paginate = require("../utils/paginate");
const { requireRole } = require("../utils/authz");

router.get("/", async (req, res) => {
  try {
    res.json(await paginate(Supplier, req));
  } catch {
    res.status(500).json({ status: "error", message: "DB error" });
  }
});

router.get("/:supID", async (req, res) => {
  const id = Number(req.params.supID);
  const row = await Supplier.findByPk(id);
  if (!row)
    return res
      .status(404)
      .json({ status: "error", message: "Supplier not found" });
  res.json(row);
});

router.post(
  "/",
  requireRole(["Administrator", "Supervisor"]),
  async (req, res) => {
    const last = await Supplier.findOne({ order: [["supID", "DESC"]] });
    const nextId = last ? last.supID + 1 : 1;
    const created = await Supplier.create({ ...req.body, supID: nextId });
    res
      .status(201)
      .json({
        status: "success",
        message: "Supplier added successfully",
        supplier: created,
      });
  }
);

router.put(
  "/:supID",
  requireRole(["Administrator", "Supervisor"]),
  async (req, res) => {
    const id = Number(req.params.supID);
    const [affected] = await Supplier.update(req.body, {
      where: { supID: id },
    });
    if (!affected)
      return res
        .status(404)
        .json({ status: "error", message: "Supplier not found" });
    res.json({ status: "success", message: "Supplier updated successfully" });
  }
);

router.delete("/:supID", requireRole(["Administrator"]), async (req, res) => {
  const id = Number(req.params.supID);
  const deleted = await Supplier.destroy({ where: { supID: id } });
  if (!deleted)
    return res
      .status(404)
      .json({ status: "error", message: "Supplier not found" });
  res.json({ status: "success", message: "Supplier deleted successfully" });
});

module.exports = router;
