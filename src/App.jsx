import React, { useState, useEffect } from "react";

const App = () => {
  const [url, setUrl] = useState("Loading...");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const CORRECT_PIN = "111";

  useEffect(() => {
    if (chrome?.tabs) {
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

  const handleUnlock = () => {
    if (pin === CORRECT_PIN) {
      chrome.storage.local.set({ isUnlocked: true }, () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.update(tabs[0].id, {
            url: "https://pixels.com",
          });
        });
      });
    } else {
      setError("Invalid PIN");
    }
  };

  return (
    <div className="w-[300px] min-h-[50px] p-4 bg-gradient-to-r from-gray-900 to-slate-800">
      <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
        <h2 className="text-white text-sm font-semibold mb-2">Enter PIN</h2>
        <input
          type="password"
          maxLength="3"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full p-2 mb-2 bg-white/10 rounded border-none text-white"
          placeholder="Enter 111 to unlock"
        />
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <button
          onClick={handleUnlock}
          className="w-full bg-blue-500 text-white p-2 rounded mt-2"
        >
          Unlock Site
        </button>
      </div>
    </div>
  );
};

export default App;
