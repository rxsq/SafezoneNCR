const express = require("express");
const router = express.Router();
const { Product } = require("../db/models");
const paginate = require("../utils/paginate");
const { requireRole } = require("../utils/authz");

// GET all (pagination)
router.get("/", async (req, res) => {
  try {
    res.json(await paginate(Product, req));
  } catch {
    res.status(500).json({ status: "error", message: "DB error" });
  }
});

// GET by id
router.get("/:prodID", async (req, res) => {
  const id = Number(req.params.prodID);
  const row = await Product.findByPk(id);
  if (!row)
    return res
      .status(404)
      .json({ status: "error", message: "Product not found" });
  res.json(row);
});

// POST
router.post(
  "/",
  requireRole(["Administrator", "Supervisor"]),
  async (req, res) => {
    const last = await Product.findOne({ order: [["prodID", "DESC"]] });
    const nextId = last ? last.prodID + 1 : 1;
    const created = await Product.create({ ...req.body, prodID: nextId });
    res
      .status(201)
      .json({
        status: "success",
        message: "Product added successfully",
        productId: created.prodID,
      });
  }
);

// PUT
router.put(
  "/:prodID",
  requireRole(["Administrator", "Supervisor"]),
  async (req, res) => {
    const id = Number(req.params.prodID);
    const [affected] = await Product.update(req.body, {
      where: { prodID: id },
    });
    if (!affected)
      return res
        .status(404)
        .json({ status: "error", message: "Product not found" });
    res.json({ status: "success", message: "Product updated successfully" });
  }
);

// DELETE
router.delete("/:prodID", requireRole(["Administrator"]), async (req, res) => {
  const id = Number(req.params.prodID);
  const deleted = await Product.destroy({ where: { prodID: id } });
  if (!deleted)
    return res
      .status(404)
      .json({ status: "error", message: "Product not found" });
  res.json({ status: "success", message: "Product deleted successfully" });
});

module.exports = router;
