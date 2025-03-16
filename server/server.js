const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || 'your-secret-api-key';

// Simple in-memory store for download status
// In a production app, you might use a database instead
const downloads = {};

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
  
  // Generate a unique ID for this download
  const downloadId = Date.now().toString();
  
  // Store download in our tracking system
  downloads[downloadId] = {
    url,
    status: 'downloading',
    startTime: new Date(),
    endTime: null,
    error: null
  };
  
  console.log(`Received download request for: ${url}`);
  
  // Respond immediately with the download ID
  res.json({ 
    success: true, 
    message: 'Download initiated',
    downloadId: downloadId
  });
  
  // Execute streamrip command in the background
  exec(`rip url "${url}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      downloads[downloadId].status = 'failed';
      downloads[downloadId].error = error.message;
    } else if (stderr) {
      console.error(`stderr: ${stderr}`);
      downloads[downloadId].status = 'failed';
      downloads[downloadId].error = stderr;
    } else {
      console.log(`stdout: ${stdout}`);
      downloads[downloadId].status = 'completed';
    }
    
    downloads[downloadId].endTime = new Date();
  });
});

// Check download status
app.get('/download/:id', authenticate, (req, res) => {
  const downloadId = req.params.id;
  
  if (!downloads[downloadId]) {
    return res.status(404).json({ error: 'Download not found' });
  }
  
  res.json(downloads[downloadId]);
});

// Get all downloads (could be restricted or paginated in production)
app.get('/downloads', authenticate, (req, res) => {
  res.json(downloads);
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