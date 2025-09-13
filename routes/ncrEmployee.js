const express = require("express");
const router = express.Router();
const { NcrEmployee } = require("../db/models");

router.get("/", async (_req, res) => {
  try {
    res.json(await NcrEmployee.findAll());
  } catch {
    res.status(500).json({ status: "error", message: "DB error" });
  }
});

router.get("/:ncrEmpID", async (req, res) => {
  const id = Number(req.params.ncrEmpID);
  const row = await NcrEmployee.findByPk(id);
  if (!row)
    return res
      .status(404)
      .json({ status: "error", message: "NCR Employee not found" });
  res.json(row);
});

module.exports = router;
