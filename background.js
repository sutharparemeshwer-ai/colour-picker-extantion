chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Listens for a request to take a screenshot
  if (request.action === 'takeScreenshot') {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        sendResponse({ error: chrome.runtime.lastError.message });
        return;
      }
      sendResponse({ screenshotUrl: dataUrl });
    });
    return true; // Indicates that the response is sent asynchronously.
  } 
  // Listens for the final picked color from the content script
  else if (request.action === 'colorPicked' && request.color) {
    // Saves the color to storage so the popup can retrieve it next time it opens.
    chrome.storage.sync.set({ lastColor: request.color });
  }
});