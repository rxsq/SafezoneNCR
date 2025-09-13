// routes/auth.js
const express = require("express");
const { Op } = require("sequelize");
const csrf = require("csurf");
const bcrypt = require("bcrypt");
const { Employee, EmployeePosition } = require("../db/models");

const router = express.Router();
const csrfProtection = csrf({ cookie: true });

router.get("/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

router.post("/login", csrfProtection, async (req, res) => {
  try {
    const username = (req.body?.username || "").trim();
    const password = req.body?.password || "";
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "username and password are required" });
    }

    const user = await Employee.findOne({
      where: { [Op.or]: [{ empUsername: username }, { empEmail: username }] },
      include: [{ model: EmployeePosition, foreignKey: "posID" }],
    });

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.empPassword);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    req.session.user = {
      empID: user.empID,
      name: `${user.empFirst} ${user.empLast}`.trim(),
      role: user.EmployeePosition?.posDescription || "Unknown Role",
      posID: user.posID,
    };

    res.json({ message: "ok", user: req.session.user });
  } catch (e) {
    console.error("Login error:", e);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/logout", csrfProtection, (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("sid");
    res.json({ message: "ok" });
  });
});

router.get("/me", (req, res) => {
  if (!req.session?.user)
    return res.status(401).json({ message: "Unauthorized" });
  res.json({ user: req.session.user });
});

module.exports = router;
