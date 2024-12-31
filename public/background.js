chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
      try {
        const url = new URL(changeInfo.url);
        const hostname = url.hostname.replace('www.', '');
        
        chrome.storage.local.get(['blockedDomains', 'isUnlocked'], (result) => {
          const blockedDomains = result.blockedDomains || [];
          const isBlocked = blockedDomains.some(domain => 
            hostname === domain || 
            hostname.endsWith(`.${domain}`)
          );
  
          if (isBlocked && !result.isUnlocked) {
            chrome.storage.local.set({ 
              originalUrl: changeInfo.url,
              currentBlockedDomain: hostname
            }, () => {
              // Prevent navigation and show popup
              chrome.tabs.update(tabId, { 
                url: 'chrome://newtab' 
              }, () => {
                // Force open the extension popup
                chrome.action.openPopup();
              });
            });
          }
        });
      } catch (err) {
        console.error('URL parsing error:', err);
      }
    }
  });
  
  // Reset lock state when tab is closed
  chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    chrome.storage.local.remove(['isUnlocked', 'originalUrl']);
  });

  chrome.webNavigation.onCommitted.addListener((details) => {
    if (details.frameId === 0) { // Main frame only
      try {
        const url = new URL(details.url);
        const hostname = url.hostname.replace('www.', '');
        
        chrome.storage.local.get(['blockedDomains', 'isUnlocked'], (result) => {
          const blockedDomains = result.blockedDomains || [];
          const isBlocked = blockedDomains.some(domain => 
            hostname === domain || 
            hostname.endsWith(`.${domain}`)
          );
  
          if (isBlocked && !result.isUnlocked) {
            chrome.storage.local.set({ 
              originalUrl: details.url,
              currentBlockedDomain: hostname
            }, () => {
              chrome.tabs.update(details.tabId, { 
                url: chrome.runtime.getURL('blocked.html') 
              });
            });
          }
        });
      } catch (err) {
        console.error('URL parsing error:', err);
      }
    }
  });