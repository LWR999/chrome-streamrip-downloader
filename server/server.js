const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || 'your-secret-api-key';

// Middleware
app.use(express.json());
app.use(cors());

// Authentication middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }
  
  const token = authHeader.split(' ')[1];
  
  if (token !== API_KEY) {
    return res.status(403).json({ error: 'Invalid API key' });
  }
  
  next();
};

// Routes
app.post('/download', authenticate, (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  
  // Validate URL to prevent command injection
  if (!isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }
  
  console.log(`Received download request for: ${url}`);
  
  // Execute streamrip command
  exec(`rip url "${url}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }
    
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return res.status(500).json({ error: stderr });
    }
    
    console.log(`stdout: ${stdout}`);
    res.json({ 
      success: true, 
      message: 'Download initiated',
      output: stdout 
    });
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Helper function to validate URL
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});