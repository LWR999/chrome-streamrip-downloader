// Initialize context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "sendToStreamrip",
    title: "Download with Streamrip",
    contexts: ["link"]
  });
});

// Store active downloads
const activeDownloads = {};

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "sendToStreamrip" && info.linkUrl) {
    sendUrlToServer(info.linkUrl);
  }
});

// Function to send URL to the server
function sendUrlToServer(url) {
  // Get server address from storage
  chrome.storage.sync.get(['serverAddress', 'apiKey'], function(items) {
    const serverAddress = items.serverAddress || 'http://your-server-ip:3000';
    const apiKey = items.apiKey || '';
    
    // Show notification that download is starting
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'images/icon48.png',
      title: 'Streamrip Downloader',
      message: 'Sending URL to server...'
    });
    
    // Send URL to server
    fetch(`${serverAddress}/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ url: url })
    })
    .then(response => response.json())
    .then(data => {
      if (data.downloadId) {
        // Store download info
        activeDownloads[data.downloadId] = {
          url: url,
          status: 'downloading',
          checkCount: 0
        };
        
        // Show notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'images/icon48.png',
          title: 'Streamrip Downloader',
          message: `Download started for: ${url}`
        });
        
        // Start polling for status
        checkDownloadStatus(data.downloadId, serverAddress, apiKey);
      }
    })
    .catch(error => {
      // Show error notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'images/icon48.png',
        title: 'Streamrip Downloader',
        message: `Error: ${error.message}`
      });
    });
  });
}

// Function to check download status
function checkDownloadStatus(downloadId, serverAddress, apiKey) {
  // If we've already checked 120 times (about 10 minutes), stop checking
  if (activeDownloads[downloadId] && activeDownloads[downloadId].checkCount > 120) {
    console.log(`Stopped checking download ${downloadId} after 120 attempts`);
    return;
  }
  
  // Increment check count
  if (activeDownloads[downloadId]) {
    activeDownloads[downloadId].checkCount++;
  } else {
    return; // Download was removed from tracking
  }
  
  fetch(`${serverAddress}/download/${downloadId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  })
  .then(response => response.json())
  .then(data => {
    // If download completed or failed
    if (data.status === 'completed' || data.status === 'failed') {
      // Show completion notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'images/icon48.png',
        title: 'Streamrip Downloader',
        message: data.status === 'completed' 
          ? `Download completed: ${data.url}`
          : `Download failed: ${data.url} - ${data.error}`
      });
      
      // Remove from active downloads
      delete activeDownloads[downloadId];
    } else {
      // Check again in 5 seconds
      setTimeout(() => {
        checkDownloadStatus(downloadId, serverAddress, apiKey);
      }, 5000);
    }
  })
  .catch(error => {
    console.error(`Error checking download status: ${error}`);
    // Check again in 5 seconds, but with backoff
    setTimeout(() => {
      checkDownloadStatus(downloadId, serverAddress, apiKey);
    }, 5000 * Math.min(5, activeDownloads[downloadId].checkCount / 10));
  });
}