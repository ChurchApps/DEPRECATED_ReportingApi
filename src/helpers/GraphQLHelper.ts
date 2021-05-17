import { buildSchema } from 'graphql'


export class GraphQLHelper {
    static schema = buildSchema(`
        type Query {
            hello: String
        }
    `);

    // The root provides a resolver function for each API endpoint
    static root = {
        hello: () => {
            return 'Hello world!';
        },
    };

}