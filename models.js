const { Sequelize, DataTypes } = require("sequelize");
const slug = require("slug");

const sequelize = new Sequelize("sqlite::memory:"); // Example for sqlite

const User = sequelize.define("user", {
  firstName: DataTypes.TEXT,
  lastName: DataTypes.TEXT,
  dob: DataTypes.DATE,
  // You can not query with virtual fields
  slug: {
    type: new DataTypes.VIRTUAL(DataTypes.STRING, ["firstName", "lastName"]),
    get() {
      return slug(`${this.firstName} ${this.lastName}`);
    },
    set(value) {
      throw new Error("Do not try to set the `fullName` value!");
    },
  },
});

const Task = sequelize.define("task", {
  text: DataTypes.STRING,
});

User.Tasks = User.hasMany(Task, { as: "tasks" });

module.exports = { sequelize, Sequelize, User, Task };
