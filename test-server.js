require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.SERVER_PORT || 8089;

// Configure CORS
app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"]
}));

// Handle preflight requests
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");
  res.sendStatus(200);
});

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    message: 'ReportingApi is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.APP_ENV || 'unknown',
    port: port
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'ReportingApi',
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  // console.log(`ReportingApi server running on port ${port}`);
  // console.log(`Environment: ${process.env.APP_ENV || 'unknown'}`);
});