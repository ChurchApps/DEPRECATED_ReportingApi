# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ReportingApi Overview

The ReportingApi is a specialized service in the ChurchApps microservices architecture that provides cross-service analytics and reporting capabilities. It reads JSON-based report definitions and executes parameterized SQL queries across multiple service databases.

## Development Commands

```bash
# Setup
npm install
npm run initdb                # Initialize database (create 'reporting' database first)
npm run dev                   # Start development server with hot reload

# Build and deployment
npm run build                 # Full build pipeline (clean + lint + tsc)
npm run build-layer           # Build Lambda layer with dependencies
npm run rebuild-layer         # Clean and rebuild Lambda layer
npm run deploy-demo           # Deploy to demo environment (includes layer build)
npm run deploy-staging        # Deploy to staging environment (includes layer build)
npm run deploy-prod           # Deploy to production environment (includes layer build)

# Testing and utilities
npm run serverless-local      # Test serverless functions locally
npm run lint                  # Run ESLint with auto-fix
```

## Technology Stack

**Core Stack:**
- Node.js 20.x + TypeScript + Express.js
- MySQL with custom repository pattern
- AWS Lambda deployment via Serverless Framework v3
- @codegenie/serverless-express for HTTP handling
- Lambda layers for dependency management
- Inversify dependency injection with decorators
- ESLint for code quality

**Engine Requirements:**
- Node.js >=20.0.0
- npm >=10.0.0

## Lambda Layer Architecture

The ReportingApi uses dynamic Lambda layers for efficient dependency management:

**Layer Structure:**
- Runtime dependencies are built into a Lambda layer per deployment
- Layer contains `node_modules` in `/opt/nodejs/node_modules/` structure
- Application code excludes `node_modules` for smaller deployment packages

**Build Process:**
1. `npm run build-layer` creates `layer/nodejs/` directory structure
2. Copies `tools/layer-package.json` with production dependencies only
3. Runs `npm install --production` to build the layer
4. Serverless Framework deploys layer with function reference

**Benefits:**
- Faster cold starts (smaller function packages)
- Reduced deployment size and time
- Shared dependencies across function versions
- Automatic rebuilds when dependencies change

## POST Request Body Parsing

The API includes comprehensive custom body parsing middleware to handle AWS Lambda + API Gateway request formats without conflicts:

**Key Solution:**
- **NO body-parser middleware** (removed to prevent stream consumption conflicts)
- **Custom buffer parsing** handles all body types directly
- **Compatible with @codegenie/serverless-express** buffer format

**Supported Body Types:**
- Buffer instances (most common with @codegenie/serverless-express)
- Buffer-like objects with `type: 'Buffer'` and `data` array
- String JSON bodies
- Content-type aware parsing (JSON vs other formats)

**Error Handling:**
- Graceful fallback for malformed JSON
- Logging of parsing errors for debugging
- Empty object fallback for failed parsing

**Why This Works:**
- @codegenie/serverless-express consumes the request stream and converts to Buffer
- body-parser would try to read the same stream again, causing "stream is not readable" errors
- Our custom middleware handles the Buffer directly without stream conflicts

## Architecture

**Report Definition System:**
- Reports are defined as JSON files in the `/reports` directory
- Each report contains queries, parameters, permissions, and output formats
- Supports multi-depth query execution with parameter passing between queries
- Cross-database queries supported (membership, attendance, giving, etc.)

**Key Components:**
- `ReportController` - Main API endpoint handling report execution
- `RunReportHelper` - Orchestrates multi-depth query execution 
- `ReportResultHelper` - Combines and formats query results
- JSON report definitions with parameterized SQL queries

**Database Access:**
- Uses connection pooling via `PoolHelper` for multiple databases
- Database connections defined in `.env` file with CONNECTION_STRING_* variables
- Each query specifies which database to target via the `db` field

## Report Definition Structure

Reports are JSON files with this structure:
```json
{
  "displayName": "Report Name",
  "description": "Report description", 
  "queries": [
    {
      "depth": 0,
      "keyName": "main",
      "db": "membership",
      "sqlLines": ["SELECT * FROM table WHERE param = :paramName"]
    }
  ],
  "parameters": [
    {
      "keyName": "paramName",
      "source": "au|query",
      "sourceKey": "churchId|fieldName"
    }
  ],
  "permissions": [
    {
      "requireOne": [
        {"action": "View", "contentType": "Reports", "api": "AttendanceApi"}
      ]
    }
  ],
  "outputs": [
    {
      "outputType": "table|barChart",
      "columns": [...]
    }
  ]
}
```

## Development Patterns

**Report Execution Flow:**
1. Load JSON report definition from `/reports` directory
2. Check permissions via `checkPermissions()` method
3. Populate root parameters from authenticated user or query string
4. Execute queries in depth order (0, 1, 2, etc.)
5. Pass query results as parameters to subsequent depth queries
6. Combine results and format according to output definitions

**Parameter Sources:**
- `au` - From authenticated user (e.g., `churchId`)
- `query` - From previous query results (e.g., `tableName.fieldName`)
- Query string parameters automatically mapped by parameter `keyName`

**Permission System:**
- Each report defines required permissions as groups
- Between groups uses AND logic
- Within groups uses OR logic
- Leverages standard ChurchApps permission structure

## Environment Setup

1. Create MySQL database named `reporting`
2. Copy `dotenv.sample.txt` to `.env`
3. Configure database connection strings for all services:
   - CONNECTION_STRING_MEMBERSHIP
   - CONNECTION_STRING_ATTENDANCE  
   - CONNECTION_STRING_GIVING
   - CONNECTION_STRING_ACCESS
4. Run `npm run initdb` to initialize database tables

## Common Development Tasks

**Adding New Reports:**
1. Create JSON definition file in `/reports` directory
2. Define SQL queries with parameterized syntax (`:paramName`)
3. Set appropriate permissions and output formats
4. Test via `/reports/{keyName}/run` endpoint

**Cross-Service Queries:**
- Specify target database in query `db` field
- Use appropriate connection string environment variables
- Ensure proper permissions for cross-service data access

**Multi-Depth Query Chains:**
- Set `depth` field in queries (0, 1, 2, etc.)
- Use `source: "query"` parameters to pass results between depths
- Reference previous results via `tableName.fieldName` syntax