import React, { useState, useEffect } from "react";

const App = () => {
  const [url, setUrl] = useState("Loading...");

  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        try {
          const currentUrl = new URL(tabs[0].url);
          setUrl(currentUrl.hostname);
        } catch (err) {
          setUrl("Unable to get URL");
        }
      });
    }
  }, []);

  return (
    <div className="w-[300px] min-h-[100px] p-4 bg-gradient-to-r from-gray-900 to-slate-800">
      <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
        <h2 className="text-white text-sm font-semibold mb-2">Current Tab</h2>
        <p className="text-gray-300 text-xs break-all">{url}</p>
      </div>
    </div>
  );
};

export default App;
