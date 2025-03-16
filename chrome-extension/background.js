// Initialize context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "sendToStreamrip",
      title: "Download with Streamrip",
      contexts: ["link"]
    });
  });
  
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
        // Show success notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'images/icon48.png',
          title: 'Streamrip Downloader',
          message: `Success! Server is downloading: ${url}`
        });
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