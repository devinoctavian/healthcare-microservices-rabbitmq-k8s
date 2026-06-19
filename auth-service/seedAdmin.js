const sequelize = require("./config/database");
const User = require("./models/User");
const bcrypt = require("bcryptjs");

(async () => {
  await sequelize.sync();

  const exists = await User.findOne({
    where: { email: "admin@klinik.ac.id" }
  });

  if (!exists) {
    const hash = await bcrypt.hash("admin123", 10);
    await User.create({
      name: "Admin Klinik",
      email: "admin@klinik.ac.id",
      password: hash,
      role: "admin"
    });
    console.log("Admin created");
  } else {
    console.log("Admin already exists");
  }

  process.exit();
})();
