import { readFileSync } from "fs";
import express from "express";
import cors from "cors";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServer } from "@apollo/server";
import { createServer } from "http";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { PubSub } from "graphql-subscriptions";

import { getUsers } from "./src/services/getUsers.service";
import { getUser } from "./src/services/getUser.service";

const typeDefs = readFileSync("./schema.graphql", { encoding: "utf-8" });

const pubSub = new PubSub();

const mockLongLastFind = (data: any) => {
    setTimeout(() => {
        pubSub.publish("LAST_FIND", { lastfind: data });
    }, 3000);
};

const resolvers = {
    Query: {
        users: async () => {
            const data = await getUsers();
            return data;
        },
    },
    Mutation: {
        findUser: async (root: any, { id }: any) => {
            const data = await getUser(id);
            mockLongLastFind(data);
            return data;
        },
    },
    Subscription: {
        lastfind: {
            subscribe: () => pubSub.asyncIterator(["LAST_FIND"]),
        },
    },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

const port = process.env.port || 4000;

const app = express();
app.use(cors());
const httpServer = createServer(app);

const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
});

const apolloServer = new ApolloServer({
    schema,
    plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
            async serverWillStart() {
                return {
                    async drainServer() {
                        await wsServerCleanup.dispose();
                    },
                };
            },
        },
    ],
});

const wsServerCleanup = useServer({ schema }, wsServer);

const main = async () => {
    await apolloServer.start();

    app.use(express.json());
    app.use("/graphql", expressMiddleware(apolloServer));

    httpServer.listen(port, () => {
        console.log(`Query endpoint ready at http://localhost:${port}/graphql`);
    });
};

main();
