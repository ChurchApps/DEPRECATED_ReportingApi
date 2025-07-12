const express = require('express');
const app = express();
const port = 8089;

app.get('/', (req, res) => {
  res.json({ message: 'ReportingApi is running!', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  // console.log(`Server running on port ${port}`);
});