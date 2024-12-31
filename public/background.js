chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
      const url = new URL(changeInfo.url);
      if (url.hostname.includes('pixels.com')) {
        chrome.storage.local.get(['isUnlocked'], (result) => {
          if (!result.isUnlocked) {
            // First block the site
            chrome.tabs.update(tabId, { 
              url: chrome.runtime.getURL('blocked.html') 
            });
            
            // Then open the popup
            chrome.action.openPopup();
          }
        });
      }
    }
  });
  
  // Keep existing tab removal listener
  chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    chrome.storage.local.remove(['isUnlocked']);
  });