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

  const handleDomainKeyDown = (e) => {
    if (e.key === "Enter" && newDomain) {
      addDomain();
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
    <div className="w-[350px] max-w-full min-h-[500px] p-4 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      {/* PIN Section */}
      <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-lg shadow-xl border border-white/10 mb-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <span className="text-2xl animate-pulse">🔒</span>
          </div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Enter PIN
          </h2>
        </div>

        <div className="flex gap-3 mb-6 justify-center">
          {pin.map((digit, index) => (
            <input
              key={index}
              id={`pin-${index}`}
              type="password"
              maxLength="1"
              value={digit}
              onChange={(e) => handlePinChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-14 h-14 text-center bg-white/10 rounded-xl border-2 border-white/5 
                       text-white text-xl font-bold tracking-wider
                       focus:outline-none focus:border-blue-500/50 focus:bg-white/20
                       transition-all duration-200 shadow-lg"
              autoFocus={index === 0}
              placeholder="•"
            />
          ))}
        </div>
        <button
          onClick={handleUnlock}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 
                 text-white py-3 rounded-xl font-bold
                 hover:from-blue-600 hover:to-purple-600
                 active:scale-95 transform transition-all duration-200
                 shadow-lg shadow-blue-500/25"
        >
          Enter
        </button>

        {error && (
          <p className="text-red-400 text-xs mb-4 text-center animate-shake">
            {error}
          </p>
        )}
      </div>

      {/* Domains Management Section */}
      <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-lg shadow-xl border border-white/10">
        <h3 className="text-base font-semibold text-white/90 mb-4">
          Manage Blocked Sites
        </h3>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            onKeyDown={handleDomainKeyDown}
            placeholder="Enter domain..."
            className="flex-1 px-4 py-2 bg-white/10 rounded-xl text-sm text-white
                   border-2 border-white/5 focus:border-blue-500/50
                   focus:outline-none focus:bg-white/20 transition-all"
          />
          <button
            onClick={addDomain}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500
                   text-white rounded-xl font-medium text-sm
                   hover:from-green-600 hover:to-emerald-600
                   active:scale-95 transition-all duration-200"
          >
            Add
          </button>
        </div>

        <div className="max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {blockedDomains.map((domain, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 mb-2
                       bg-white/5 rounded-xl group hover:bg-white/10
                       transition-all duration-200"
            >
              <span className="text-sm text-white/90">{domain}</span>
              <button
                onClick={() => removeDomain(domain)}
                className="opacity-0 group-hover:opacity-100 text-red-400
                         hover:text-red-300 transition-all duration-200"
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
