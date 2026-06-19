require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", require("./routes/auth.routes"));

const PORT = 5001;

sequelize.sync().then(() => {
  console.log("Tables synced");
  app.listen(PORT, () =>
    console.log(`Auth service running on ${PORT}`)
  );
});
