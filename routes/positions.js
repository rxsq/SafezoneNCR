const express = require("express");
const router = express.Router();
const { EmployeePosition } = require("../db/models");

router.get("/", async (_req, res) => {
  try {
    res.json(await EmployeePosition.findAll());
  } catch {
    res.status(500).json({ message: "Error reading positions data." });
  }
});

module.exports = router;
