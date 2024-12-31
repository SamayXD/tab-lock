import React, { useState, useEffect } from "react";

const App = () => {
  const [url, setUrl] = useState("Loading...");
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [blockedDomains, setBlockedDomains] = useState([]);
  const CORRECT_PIN = "1234";

  useEffect(() => {
    // Load blocked domains from storage
    chrome.storage.local.get(["blockedDomains"], (result) => {
      if (result.blockedDomains) {
        setBlockedDomains(result.blockedDomains);
      }
    });

    // Get current URL
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

  const handleKeyDown = (e, index) => {
    switch (e.key) {
      case "Backspace":
        // Move to previous input if current is empty
        if (!pin[index] && index > 0) {
          const newPin = [...pin];
          newPin[index - 1] = "";
          setPin(newPin);
          document.getElementById(`pin-${index - 1}`).focus();
        }
        break;
      case "ArrowLeft":
        if (index > 0) {
          document.getElementById(`pin-${index - 1}`).focus();
        }
        break;
      case "ArrowRight":
        if (index < 3) {
          document.getElementById(`pin-${index + 1}`).focus();
        }
        break;
      case "Enter":
        handleUnlock();
        break;
    }
  };

  const handlePinChange = (index, value) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newPin = [...pin];
      newPin[index] = value;
      setPin(newPin);

      // Auto-advance to next input
      if (value && index < 3) {
        document.getElementById(`pin-${index + 1}`).focus();
      }
    }
  };

  const handleUnlock = () => {
    if (pin.join("") === CORRECT_PIN) {
      chrome.storage.local.get(["originalUrl"], (result) => {
        chrome.storage.local.set({ isUnlocked: true }, () => {
          if (result.originalUrl) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              chrome.tabs.update(tabs[0].id, { url: result.originalUrl });
              window.close(); // Close popup after unlock
            });
          }
        });
      });
    } else {
      setError("Invalid PIN");
    }
  };
  const addDomain = async () => {
    if (newDomain && !blockedDomains.includes(newDomain)) {
      // Request permission for the new domain
      const permission = `*://*.${newDomain}/*`;
      const updatedDomains = [...blockedDomains, newDomain];

      setBlockedDomains(updatedDomains);
      chrome.storage.local.set({
        blockedDomains: updatedDomains,
        isUnlocked: false,
      });
      setNewDomain("");
    }
  };

  const removeDomain = (domain) => {
    const updatedDomains = blockedDomains.filter((d) => d !== domain);
    setBlockedDomains(updatedDomains);
    chrome.storage.local.set({ blockedDomains: updatedDomains });
  };

  return (
    <div className="w-[300px] min-h-[400px] p-4 bg-gradient-to-r from-gray-900 to-slate-800">
      <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm mb-4">
        <h2 className="text-white text-sm font-semibold mb-4">Enter PIN</h2>
        <div className="flex gap-2 mb-4">
          {pin.map((digit, index) => (
            <input
              key={index}
              id={`pin-${index}`}
              type="password"
              maxLength="1"
              value={digit}
              onChange={(e) => handlePinChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-12 text-center bg-white/10 rounded border-none text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus={index === 0}
            />
          ))}
        </div>
        {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
        <button
          onClick={handleUnlock}
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          Unlock Site
        </button>
      </div>

      <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
        <h2 className="text-white text-sm font-semibold mb-2">
          Blocked Domains
        </h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            className="flex-1 p-2 bg-white/10 rounded border-none text-white text-sm"
            placeholder="Enter domain..."
          />
          <button
            onClick={addDomain}
            className="bg-green-500 text-white px-3 rounded"
          >
            Add
          </button>
        </div>

        <div className="max-h-[150px] overflow-y-auto">
          {blockedDomains.map((domain, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-white/5 rounded p-2 mb-2"
            >
              <span className="text-white text-sm">{domain}</span>
              <button
                onClick={() => removeDomain(domain)}
                className="text-red-500 text-xs"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
