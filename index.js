const {
  ApolloServer,
  gql,
  ApolloError,
  withFilter,
  PubSub,
} = require("apollo-server");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtKey = "my_secret_key";
const pubsub = new PubSub(); //

const typeDefs = gql`
  type User {
    email: String
    password: String
  }

  type Message {
    to: String
    text: String
  }

  type Query {
    messages: [Message]
  }

  type Mutation {
    login(email: String, password: String): String
    addMessage(to: String, text: String): Message
  }

  type Subscription {
    newMessage: Message
  }
`;

const users = [
  {
    email: "admin@gmail.com",
    hash: bcrypt.hashSync("p4ssw0rd", 10),
  },
  {
    email: "user@gmail.com",
    hash: bcrypt.hashSync("p4ssw0rd", 10),
  },
];

const messages = [];

const resolvers = {
  Query: {
    messages: () => messages,
  },
  Mutation: {
    login: (_, args) => {
      const user = users.find((el) => el.email === args.email);
      if (user && bcrypt.compareSync(args.password, user.hash)) {
        const token = jwt.sign(
          {
            user: user.email,
          },
          jwtKey,
          {
            algorithm: "HS256",
          }
        );
        return token;
      } else {
        throw new ApolloError("Invalid credentials");
      }
    },
    addMessage: (_, args) => {
      messages.push(args);
      pubsub.publish("NEW_MESSAGE", { newMessage: args });
      return args;
    },
  },
  Subscription: {
    newMessage: {
      subscribe: withFilter(
        (_, args, context) => {
          if (context.user) {
            return pubsub.asyncIterator(["NEW_MESSAGE"]);
          } else {
            throw new ApolloError("Bad token");
          }
        },
        (payload, _, context) => {
          if (context.user === payload.newMessage.to) {
            return true;
          } else {
            return false;
          }
        }
      ),
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, connection }) => {
    if (connection && connection.context) {
      return connection.context;
    } else {
      const token = req.headers.authorization;
      if (token) {
        let payload;
        try {
          payload = jwt.verify(token, jwtKey);
          return { user: payload.user };
        } catch (err) {
          throw new ApolloError("Bad token");
        }
      }
    }
  },
  subscriptions: {
    path: "/subscriptions",
    onConnect: (connectionParams) => {
      if (connectionParams && connectionParams.authorization) {
        const token = connectionParams.authorization;
        if (token) {
          let payload;
          try {
            payload = jwt.verify(token, jwtKey);
            return { user: payload.user };
          } catch (err) {
            throw new ApolloError("Bad token");
          }
        }
      } else {
        throw new ApolloError("Bad token");
      }
    },
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
