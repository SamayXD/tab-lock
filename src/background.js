chrome.action.onClicked.addListener((tab) => {
  chrome.windows.create({
    url: 'index.html',
    type: 'popup',
    width: 350,
    height: 500,
    focused: true
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'openPopup') {
    chrome.windows.create({
      url: 'index.html',
      type: 'popup',
      width: 350,
      height: 500,
      focused: true
    });
  }
});