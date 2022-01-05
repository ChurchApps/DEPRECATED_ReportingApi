# ReportingApi
REST and GraphQL API for storing and fetching reports

## Dev Setup Instructions

1. Create a MySQL database named `reporting`
2. Copy `dotenv.sample.txt` to `.env` and edit it to point to your MySQL database.
3. Pull the [apiBase](https://github.com/LiveChurchSolutions/ApiBase) submodule with: `git submodule init && git submodule update`
4. Install the dependencies with: `npm install`
5. Create the database tables with `npm run initdb`
6. Start the api with `npm run dev`


## Running Your First Query
1. Go to http://localhost:8089/graphql to access the query builder interface
2. Enter the following query to get a list a groups with first name of everyone in them.
    query{
        groups { name, people{firstName} },
    }
3. In the HTTP headers token enter the JWT like so.  This JWT can be obtain from a login request to AccessApi/users/login.
    {
        "authorization": "Bearer eyJhbGciOiJ...R0"
    }
