const express = require("express");
const router = express.Router();
const { NcrForm } = require("../db/models");
const paginate = require("../utils/paginate");
const { requireRole } = require("../utils/authz");

// read for all authenticated
router.get("/", async (req, res) => {
  try {
    res.json(await paginate(NcrForm, req));
  } catch {
    res.status(500).json({ status: "error", message: "DB error" });
  }
});

router.get("/:ncrFormID", async (req, res) => {
  const id = Number(req.params.ncrFormID);
  const row = await NcrForm.findByPk(id);
  if (!row)
    return res
      .status(404)
      .json({ status: "error", message: "NCR form not found" });
  res.json(row);
});

// create/update allowed to Admin/Supervisor
router.post(
  "/",
  requireRole(["Administrator", "Supervisor"]),
  async (req, res) => {
    const last = await NcrForm.findOne({ order: [["ncrFormID", "DESC"]] });
    const nextId = last ? last.ncrFormID + 1 : 1;
    const created = await NcrForm.create({ ...req.body, ncrFormID: nextId });
    res
      .status(201)
      .json({ message: "NCR form created successfully", ncrForm: created });
  }
);

router.put(
  "/:ncrFormID",
  requireRole(["Administrator", "Supervisor"]),
  async (req, res) => {
    const id = Number(req.params.ncrFormID);
    const [affected] = await NcrForm.update(req.body, {
      where: { ncrFormID: id },
    });
    if (!affected)
      return res
        .status(404)
        .json({ status: "error", message: "NCR form not found" });
    res.json({ status: "success", message: "NCR form updated successfully" });
  }
);

module.exports = router;
