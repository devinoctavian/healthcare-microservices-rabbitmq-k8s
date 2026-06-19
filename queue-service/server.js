require("dotenv").config();
const express = require("express");
const cors = require("cors");

const db = require("./models");
const queueRoutes = require("./routes/queue.routes");
const { connectRabbitMQ } = require("./utils/rabbitmq");
const app = express();
app.use(cors());
app.use(express.json());

app.use("/queues", require("./routes/queue.routes"));


(async () => {
  try {
    await db.sequelize.authenticate();
    console.log("MySQL connected (queue-service)");

    await db.sequelize.sync({ alter: true });
    console.log("Tables synced (queue-service)");

    await connectRabbitMQ();

    app.listen(process.env.PORT, () =>
      console.log("Queue service running on", process.env.PORT)
    );
  } catch (err) {
    console.error("DB ERROR:", err);
  }
})();
