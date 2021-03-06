const { ApolloServer, gql } = require("apollo-server");
const { resolver } = require("graphql-sequelize");
const moment = require("moment");
const numToWords = require("number-to-words");

const { User } = require("./models");
const migrate = require("./migrate");

const typeDefs = gql`
  enum AgeType {
    YEARS
    MONTHS
    DAYS
  }

  type User {
    firstName: String
    lastName: String
    dob: String
    age(in: AgeType): Int
    slug: String
    ageInString: String
    tasks: [Task]
  }

  type Task {
    id: ID
    text: String
  }

  type Query {
    user(firstName: String, slug: String): User
  }
`;

const capitalize = (s) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const resolvers = {
  Query: {
    user: resolver(User, {
      before: (findOptions, args, context) => {
        let { where } = findOptions;
        if (Object.getOwnPropertyNames(where).includes("slug")) {
          const [firstName, lastName] = where.slug.split("-");
          where.firstName = capitalize(firstName);
          where.lastName = capitalize(lastName);
          delete where.slug;
        }
        return findOptions;
      },
      after: (result, args, context) => {
        const age = moment().diff(moment(result.dob), "years");
        const ageInString = numToWords.toWordsOrdinal(age);
        return Object.assign(result, { ageInString });
      },
    }),
  },
  User: {
    age: (parent, args, context) => {
      if (!parent.dob) {
        return 0;
      }
      if (!args.in) {
        args.in = "YEARS";
      }
      return moment().diff(moment(parent.dob), args.in.toLowerCase());
    },
    dob: (parent) => {
      if (!parent.dob) {
        return "Not Set";
      }
      return moment(parent.dob).format("YYYY-MM-DD");
    },
    tasks: resolver(User.Tasks),
  },
};

migrate();

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
