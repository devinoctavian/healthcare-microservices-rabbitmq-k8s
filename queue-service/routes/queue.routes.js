const express = require("express");
const router = express.Router();
const { Queue } = require("../models");
const auth = require("../middleware/auth");
const { publishEvent } = require("../utils/rabbitmq");

/* GET QUEUE STATS (for admin dashboard) */
router.get("/stats", auth, async (req, res) => {
  try {
    const totalQueues = await Queue.count();
    const waitingQueues = await Queue.count({ where: { status: "waiting" } });
    res.json({ totalQueues, waitingQueues });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* GET ALL QUEUES (for admin) */
router.get("/all", auth, async (req, res) => {
  try {
    const data = await Queue.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* GET MY QUEUES (for logged-in patient) */
router.get("/me", auth, async (req, res) => {
  try {
    const data = await Queue.findAll({
      where: { patient_id: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* DAFTAR ANTRIAN */
router.post("/", auth, async (req, res) => {
  try {
    const { patient_name, doctor_id, doctor_name, schedule_date } = req.body;

    const lastQueue = await Queue.findOne({
      where: { doctor_id, schedule_date },
      order: [["queue_number", "DESC"]],
    });

    const nextQueue = lastQueue ? lastQueue .queue_number + 1 : 1;

    const queue = await Queue.create({
      patient_id: req.user.id, // from JWT token
      patient_name,
      doctor_id,
      doctor_name,
      schedule_date,
      queue_number: nextQueue,
    });

    // PUBLISH EVENT QUEUE_CREATED
    const eventPayload = {
      eventType: "QUEUE_CREATED",
      timestamp: new Date().toISOString(),
      source: "queue-service",
      payload: queue.toJSON()
    };
    await publishEvent("queue.created", eventPayload);

    res.json(queue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* UPDATE STATUS ANTRIAN (Untuk Poin Bonus) */
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body; // 'called', 'done', dsb.
    const queue = await Queue.findByPk(req.params.id);
    
    if (!queue) return res.status(404).json({ message: "Queue not found" });
    
    queue.status = status;
    await queue.save();

    // PUBLISH EVENT QUEUE_STATUS_UPDATED
    const eventPayload = {
      eventType: "QUEUE_STATUS_UPDATED",
      timestamp: new Date().toISOString(),
      source: "queue-service",
      payload: queue.toJSON()
    };
    await publishEvent("queue.status.updated", eventPayload);

    res.json(queue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* CEK ANTRIAN PASIEN (by name - public search) */
router.get("/patient/:name", async (req, res) => {
  const data = await Queue.findAll({
    where: { patient_name: req.params.name },
  });
  res.json(data);
});

module.exports = router;