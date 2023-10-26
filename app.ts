import { readFileSync } from "fs";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import axios from "axios";
import { UsersResponse } from "./src/interfaces/UsersResponse";

const typeDefs = readFileSync("./schema.graphql", { encoding: "utf-8" });

// interface MyContext {
//     dataSources: {
//         books: Book[];
//     };
// }

interface Book {
    title: string;
    author: string;
}

const books = [
    {
        title: "The Awakening",
        author: "Kate Chopin",
    },
    {
        title: "City of Glass",
        author: "Paul Auster",
    },
];

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers = {
    Query: {
        users: async () => {
            const { data } = await axios.get<UsersResponse>(
                "https://jsonplaceholder.typicode.com/users"
            );
            return data;
        },
    },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
    typeDefs,
    resolvers,
});

const main = async () => {
    // Passing an ApolloServer instance to the `startStandaloneServer` function:
    //  1. creates an Express app
    //  2. installs your ApolloServer instance as middleware
    //  3. prepares your app to handle incoming requests
    const { url } = await startStandaloneServer(server, {
        listen: { port: 4000 },
    });

    console.log(`🚀  Server ready at: ${url}`);
};

main();
