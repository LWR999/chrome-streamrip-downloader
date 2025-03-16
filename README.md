# Streamrip URL Downloader

A Chrome extension that sends URLs to a Linux server running streamrip for downloading.

## Project Structure

- **chrome-extension/**: Chrome extension files
  - `manifest.json`: Extension configuration
  - `background.js`: Background script for context menu and requests
  - `options.html/js`: Configuration UI for server address

- **server/**: Node.js server to receive URLs and execute streamrip
  - `server.js`: Express server implementation
  - `package.json`: Node.js dependencies
  - `.env`: Environment variables (not tracked in git)

## Setup Instructions

### Server Setup
1. Install Node.js on your Linux server
2. Navigate to the server directory
3. Run `npm install` to install dependencies
4. Create a `.env` file with your API key and port settings
5. Start the server with `npm start` or set up a service for persistent running

### Chrome Extension Setup
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top-right corner
3. Click "Load unpacked" and select the `chrome-extension` directory
4. Click on the extension options and configure your server address and API key

## Usage

1. Right-click on any link in Chrome
2. Select "Download with Streamrip" from the context menu
3. The URL will be sent to your Linux server
4. The server will execute the streamrip command
5. You'll receive a notification in Chrome about the download status

## Security Considerations

- The server is configured to only accept requests with a valid API key
- URL validation helps prevent command injection
- Keep your `.env` file secure and don't commit it to git

## Development

For local development:
- Server: Make changes to server.js and restart the Node process
- Extension: Make changes, then reload the extension in chrome://extensions/