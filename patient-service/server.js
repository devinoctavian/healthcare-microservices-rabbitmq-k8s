require("dotenv").config();
const express = require("express");
const cors = require("cors");

const db = require("./models");
const patientRoutes = require("./routes/patient.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/patients", patientRoutes);

(async () => {
  try {
    await db.sequelize.authenticate();
    console.log("MySQL connected (patient-service)");

    await db.sequelize.sync({ alter: true });
    console.log("Tables synced (patient-service)");

    app.listen(5003, () =>
      console.log("Patient service running on port 5003")
    );
  } catch (err) {
    console.error("DB ERROR:", err);
  }
})();
