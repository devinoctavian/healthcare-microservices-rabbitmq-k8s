module.exports = (sequelize, DataTypes) => {
  const Queue = sequelize.define("Queue", {
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // optional for backward compatibility
    },
    patient_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    doctor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    doctor_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    schedule_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    queue_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "waiting",
    },
  });

  return Queue;
};