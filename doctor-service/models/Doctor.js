module.exports = (sequelize, DataTypes) => {
  const Doctor = sequelize.define(
    "Doctor",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      specialization: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      schedule: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
    },
    {
      tableName: "doctors",
      timestamps: false,
    }
  );

  return Doctor;
};
