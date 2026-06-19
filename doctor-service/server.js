require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { sequelize } = require("./models");
const doctorRoutes = require("./routes/doctor.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/", doctorRoutes);

(async () => {
  try {
    await sequelize.authenticate();
    console.log("MySQL connected (doctor-service)");

    await sequelize.sync({ alter: true });
    console.log("Tables synced (doctor-service)");

    app.listen(process.env.PORT, () =>
      console.log("Doctor service running on", process.env.PORT)
    );
  } catch (err) {
    console.error("DB FATAL ERROR:", err);
  }
})();
