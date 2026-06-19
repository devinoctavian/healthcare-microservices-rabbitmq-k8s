const express = require("express");
const { Doctor } = require("../models");
const { authOnly, adminOnly } = require("../middleware/auth");

const router = express.Router();

/* GET ALL - any logged-in user can view doctors */
router.get("/doctors", authOnly, async (req, res) => {
  try {
    const data = await Doctor.findAll();
    res.json(data);
  } catch (err) {
    console.error("GET DOCTORS ERROR:", err);
    res.status(500).json({ message: "Failed get doctors" });
  }
});

/* CREATE - admin only */
router.post("/doctors", adminOnly, async (req, res) => {
  try {
    const { name, specialization, schedule } = req.body;

    const doctor = await Doctor.create({
      name,
      specialization,
      schedule
    });

    res.json(doctor);
  } catch (err) {
    console.error("CREATE DOCTOR ERROR:", err);
    res.status(500).json({ message: "Failed create doctor" });
  }
});

/* UPDATE - admin only */
router.put("/doctors/:id", adminOnly, async (req, res) => {
  try {
    await Doctor.update(req.body, {
      where: { id: req.params.id }
    });
    res.json({ msg: "updated" });
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ message: "Failed update doctor" });
  }
});

/* DELETE - admin only */
router.delete("/doctors/:id", adminOnly, async (req, res) => {
  try {
    await Doctor.destroy({
      where: { id: req.params.id }
    });
    res.json({ msg: "deleted" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: "Failed delete doctor" });
  }
});

module.exports = router;
