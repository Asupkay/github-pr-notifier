# Pull Request Notifier

A Chrome extension for getting notifications when PRs need your attention.

## Features

- View PRs where your review is requested
- View your own open PRs
- Automatic refresh every minute
- Badge notification with count of review requests
- Manual refresh option

## Installation

Install from the Chrome Web Store (link will be updated once the new listing is live).

## Local Development & Testing

1. **Open Chrome Extensions page:**
   - Navigate to `chrome://extensions/` in your browser
   - Or click the three dots menu → Extensions → Manage Extensions

2. **Enable Developer Mode:**
   - Toggle the "Developer mode" switch in the top-right corner

3. **Load the extension:**
   - Click "Load unpacked" button
   - Navigate to this project folder
   - Select the folder and click "Select"

4. **Set up your GitHub token:**
   - Click the extension icon in your browser toolbar (you may need to pin it first)
   - Create a GitHub personal access token at https://github.com/settings/personal-access-tokens
   - When setting up the token:
     - Choose an expiration date (or "No expiration" for continuous access)
     - Select repository access: public repositories, all repositories, or selected repositories
     - Grant read-only access to Pull Requests
   - Enter the token in the extension and click Submit

5. **Use the extension:**
   - View PRs where your review is requested in the "Review Requests" tab
   - View your own open PRs in the "Open PRs" tab
   - Click the refresh icon to manually update
   - The extension automatically refreshes every minute

## Development

**Reload after changes:**
- Go to `chrome://extensions/`
- Click the refresh/reload icon on the extension card
- This will reload the extension with your latest changes

**Debugging:**
- Right-click the extension popup and select "Inspect" to debug the popup JavaScript
- Check the browser console (F12) for any errors
