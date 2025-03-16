// Save options to chrome.storage
function saveOptions() {
    const serverAddress = document.getElementById('serverAddress').value;
    const apiKey = document.getElementById('apiKey').value;
    
    chrome.storage.sync.set(
      { 
        serverAddress: serverAddress,
        apiKey: apiKey 
      },
      function() {
        // Update status to let user know options were saved
        const status = document.getElementById('status');
        status.textContent = 'Settings saved.';
        status.className = 'success';
        status.style.display = 'block';
        
        setTimeout(function() {
          status.style.display = 'none';
        }, 3000);
      }
    );
  }
  
  // Restores options from chrome.storage
  function restoreOptions() {
    chrome.storage.sync.get(
      {
        serverAddress: 'http://your-server-ip:3000',
        apiKey: ''
      },
      function(items) {
        document.getElementById('serverAddress').value = items.serverAddress;
        document.getElementById('apiKey').value = items.apiKey;
      }
    );
  }
  
  // Add event listeners
  document.addEventListener('DOMContentLoaded', restoreOptions);
  document.getElementById('save').addEventListener('click', saveOptions);