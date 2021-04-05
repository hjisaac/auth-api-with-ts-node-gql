import express, { response } from "express";
import { graphqlHTTP } from "express-graphql";
import dotenv from "dotenv";
import { createConnection } from "typeorm";

import { schema, root } from "./api/schema";

dotenv.config();

createConnection().then(async connection => {

}).catch(error => {
    console.log(error);
});

const app = express();
app.use(express.json());

// define graphql middleware

app.use(process.env.GRAPHQL_PATH!, graphqlHTTP((request, response, graphQLparams) => ({
        schema: schema,
        rootValue: root,
        graphiql: true,
        context: {
            req: request,
            res: response,
        }
    }))
);

app.listen(parseInt(process.env.APP_PORT!));
console.log(`Server on http://localhost:${process.env.APP_PORT}${process.env.GRAPHQL_PATH}`);