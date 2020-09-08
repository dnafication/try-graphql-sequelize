const { User, Task } = require("./models");
const moment = require("moment");

const migrate = async () => {
  await User.sync();
  await Task.sync();
  await User.create(
    {
      firstName: "Dinanath",
      lastName: "Basumatary",
      dob: moment("2001-11-12"),
      tasks: [
        { text: "buy groceries" },
        { text: "do yoga" },
        { text: "work for 9 hours" }
      ]
    },
    {
      include: [User.Tasks]
    }
  );
  await User.create({ firstName: "Danny", lastName: "Boy" });
  await User.create({ firstName: "J", lastName: "D" });
  console.log(`*** Migration done ***`);

  // get the first user
  const user = await User.findOne({ where: { id: 1 }, include: User.Tasks });
  console.log("user including tasks", user.toJSON());
  console.log("-------------------------------");
};

module.exports = migrate;
