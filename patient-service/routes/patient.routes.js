const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Patient } = require("../models");

const router = express.Router();

// Auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ msg: "Invalid token" });
  }
};

/* REGISTER */
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const exist = await Patient.findOne({ where: { email } });
    if (exist) return res.status(400).json({ msg: "Email already used" });

    const hashed = await bcrypt.hash(password, 10);

    const patient = await Patient.create({
      name,
      email,
      phone,
      password: hashed,
    });

    // AUTO LOGIN
    const token = jwt.sign(
      { id: patient.id, role: "patient" },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "1d" }
    );

    res.json({
      token,
      patient: {
        id: patient.id,
        name: patient.name,
        email: patient.email,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

/* LOGIN */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const patient = await Patient.findOne({ where: { email } });
    if (!patient) return res.status(400).json({ msg: "Email tidak ditemukan" });

    const valid = await bcrypt.compare(password, patient.password);
    if (!valid) return res.status(400).json({ msg: "Password salah" });

    const token = jwt.sign(
      { id: patient.id, role: "patient" },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "1d" }
    );

    res.json({
      token,
      patient: {
        id: patient.id,
        name: patient.name,
        email: patient.email,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

/* GET CURRENT PATIENT */
router.get("/me", auth, async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "phone"],
    });
    if (!patient) return res.status(404).json({ msg: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;

