chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
      const url = new URL(changeInfo.url);
      if (url.hostname.includes('pixels.com')) {
        chrome.storage.local.get(['isUnlocked'], (result) => {
          if (!result.isUnlocked) {
            chrome.tabs.update(tabId, { 
              url: chrome.runtime.getURL('blocked.html') 
            });
          }
        });
      }
    }
  });