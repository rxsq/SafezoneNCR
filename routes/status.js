const express = require("express");
const router = express.Router();
const { NcrStatus } = require("../db/models");

router.get("/", async (_req, res) => {
  try {
    res.json(await NcrStatus.findAll());
  } catch {
    res.status(500).json({ message: "Error reading NCR statuses data." });
  }
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const row = await NcrStatus.findByPk(id);
  if (!row)
    return res
      .status(404)
      .json({ message: `NCR status with ID ${id} not found` });
  res.json(row);
});

module.exports = router;
