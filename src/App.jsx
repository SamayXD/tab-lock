import React, { useState, useEffect } from "react";
import loadGIF from "/public/W9UN.gif";

const App = () => {
  const [url, setUrl] = useState("Loading...");
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [blockedDomains, setBlockedDomains] = useState([]);
  const CORRECT_PIN = "1234";
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [verifyPin, setVerifyPin] = useState(["", "", "", ""]);
  const [showStats, setShowStats] = useState(false);
  const [domainStats, setDomainStats] = useState(() => {
    const saved = localStorage.getItem("domainStats");
    return saved ? JSON.parse(saved) : {};
  });
  const [domainCategories] = useState({
    social: "🎭",
    productivity: "💼",
    entertainment: "🎮",
    custom: "🔒",
  });
  const [currentPage, setCurrentPage] = useState("main");
  const [isVerifyingSettings, setIsVerifyingSettings] = useState(false);
  const [settings, setSettings] = useState({
    autoLock: true,
    notifyAttempts: true,
    lockDuration: 30,
    darkMode: true,
  });
  const [isLoading, setIsLoading] = useState(false);

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

  // Add initial focus effect
  useEffect(() => {
    document.getElementById("pin-0")?.focus();
  }, []);

  const handleRemoveDomain = (domain) => {
    setSelectedDomain(domain);
    setShowVerifyModal(true);
    setVerifyPin(["", "", "", ""]);
  };

  const verifyAndRemove = () => {
    if (verifyPin.join("") === CORRECT_PIN) {
      const updatedDomains = blockedDomains.filter((d) => d !== selectedDomain);
      setBlockedDomains(updatedDomains);
      chrome.storage.local.set({ blockedDomains: updatedDomains });
      setShowVerifyModal(false);
      setVerifyPin(["", "", "", ""]);
    } else {
      setError("Invalid PIN");
    }
  };

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

      if (value && index < 3) {
        document.getElementById(`pin-${index + 1}`).focus();
      } else if (index === 3) {
        // Wait for last digit to be set
        setTimeout(() => {
          const completePin = [...newPin.slice(0, 3), value].join("");
          handleUnlock(completePin);
        }, 100);
      }
    }
  };

  const handleUnlock = (completePin) => {
    try {
      if (completePin === CORRECT_PIN) {
        chrome.storage.local.get(["originalUrl"], (result) => {
          chrome.storage.local.set({ isUnlocked: true }, () => {
            if (result.originalUrl) {
              chrome.tabs.query(
                { active: true, currentWindow: true },
                (tabs) => {
                  chrome.tabs
                    .update(tabs[0].id, { url: result.originalUrl })
                    .then(() => window.close())
                    .catch((err) =>
                      console.error("Failed to update tab:", err)
                    );
                }
              );
            }
          });
        });
      } else {
        setError("Invalid PIN");
        setPin(["", "", "", ""]);
        document.getElementById("pin-0")?.focus();
      }
    } catch (err) {
      console.error("Error in handleUnlock:", err);
      setError("An error occurred");
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

  const handleSettingsAccess = () => {
    setIsVerifyingSettings(true);
    setPin(["", "", "", ""]);
  };

  const verifySettingsAccess = () => {
    const enteredPin = verifyPin.join("");
    console.log("Entered PIN:", enteredPin); // Debug log
    console.log("Correct PIN:", CORRECT_PIN); // Debug log

    if (enteredPin === CORRECT_PIN) {
      setCurrentPage("settings");
      setIsVerifyingSettings(false);
      setVerifyPin(["", "", "", ""]);
      setError("");
    } else {
      setError("Invalid PIN");
      setVerifyPin(["", "", "", ""]);
      document.getElementById("verify-pin-0")?.focus();
    }
  };

  const handleVerifyPinChange = (index, value) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newVerifyPin = [...verifyPin];
      newVerifyPin[index] = value;
      setVerifyPin(newVerifyPin);

      if (value && index < 3) {
        document.getElementById(`verify-pin-${index + 1}`).focus();
      } else if (index === 3) {
        const completePin = [...newVerifyPin.slice(0, 3), value].join("");
        setTimeout(() => {
          if (completePin === CORRECT_PIN) {
            setCurrentPage("settings");
            setIsVerifyingSettings(false);
            setVerifyPin(["", "", "", ""]);
            setError("");
          } else {
            setError("Invalid PIN");
            setVerifyPin(["", "", "", ""]);
            document.getElementById("verify-pin-0")?.focus();
          }
        }, 100);
      }
    }
  };

  return (
    <div className="w-[350px] max-w-full min-h-[400px] p-4 bg-[#111111] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <img
          src={loadGIF}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-5"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "🔒";
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            TAB LOCK
          </h1>
        </div>

        {currentPage === "main" && (
          <>
            {/* PIN Section */}
            <div className="bg-black/[0.09] rounded-lg p-6 backdrop-blur-sm shadow-xl border border-white/[0.03] mb-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-3 rounded-lg bg-gradient-to-b from-neutral-800 to-neutral-900 flex items-center justify-center border border-neutral-700/30">
                  <span className="text-2xl">🔒</span>
                </div>
                <h2 className="text-lg font-medium text-white/90">Enter PIN</h2>
              </div>

              <div className="flex gap-2 mb-6 justify-center">
                {pin.map((digit, index) => (
                  <input
                    key={index}
                    id={`pin-${index}`}
                    type="password"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-12 h-12 text-center bg-neutral-900/50 rounded-lg 
                             border border-neutral-800 text-white text-lg font-medium
                             focus:outline-none focus:border-neutral-600
                             transition-all duration-200"
                    placeholder=""
                  />
                ))}
              </div>

              {error && (
                <p className="text-red-400 text-xs mb-4 text-center animate-shake">
                  {error}
                </p>
              )}
            </div>

            {/* Bottom Navigation */}
            <button
              onClick={handleSettingsAccess}
              className="w-full py-3 mt-4 bg-white/5 rounded-lg hover:bg-white/10 
                       text-white/70 text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              <span>⚙️</span>
              Manage Domains
            </button>
          </>
        )}

        {currentPage === "settings" && (
          <div className="bg-white/[0.03] rounded-lg p-6 backdrop-blur-sm shadow-xl border border-white/[0.03]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-white/90">
                Manage Domains
              </h2>
              <button
                onClick={() => setCurrentPage("main")}
                className="text-white/50 hover:text-white/90 transition-all"
              >
                ← Back
              </button>
            </div>

            {/* Add Domain Section */}
            <div className="space-y-4 mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  onKeyDown={handleDomainKeyDown}
                  placeholder="Enter domain to block..."
                  className="flex-1 px-4 py-2 bg-neutral-900/50 rounded-lg text-sm 
                           text-white border border-neutral-800
                           focus:outline-none focus:border-neutral-600"
                />
                <button
                  onClick={addDomain}
                  className="px-4 py-2 bg-neutral-800 text-white/90 rounded-lg 
                           hover:bg-neutral-700 active:bg-neutral-600
                           transition-all duration-200 text-sm font-medium"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Domains List */}
            <div className="space-y-2 max-h-[280px] overflow-y-auto">
              {blockedDomains.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-4">
                  No domains blocked yet
                </p>
              ) : (
                blockedDomains.map((domain) => (
                  <div
                    key={domain}
                    className="flex items-center justify-between p-3 
                             bg-neutral-900/30 rounded-lg group"
                  >
                    <span className="text-sm text-white/70">{domain}</span>
                    <button
                      onClick={() => removeDomain(domain)}
                      className="opacity-0 group-hover:opacity-100 text-neutral-500
                               hover:text-red-400/80 transition-all duration-200"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Domain Count */}
            <div className="mt-4 pt-4 border-t border-white/[0.05] text-xs text-white/30">
              {blockedDomains.length}{" "}
              {blockedDomains.length === 1 ? "domain" : "domains"} blocked
            </div>
          </div>
        )}

        {/* Settings PIN Verification Modal */}
        {isVerifyingSettings && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-neutral-900 p-6 rounded-lg w-72 border border-white/10">
              <h4 className="text-white/90 text-sm mb-4 text-center">
                Enter PIN to access settings
              </h4>
              <div className="flex gap-2 mb-4 justify-center">
                {verifyPin.map((digit, index) => (
                  <input
                    key={index}
                    id={`verify-pin-${index}`}
                    type="password"
                    maxLength="1"
                    value={digit}
                    onChange={(e) =>
                      handleVerifyPinChange(index, e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") verifySettingsAccess();
                      if (e.key === "Backspace" && !digit && index > 0) {
                        document
                          .getElementById(`verify-pin-${index - 1}`)
                          ?.focus();
                      }
                    }}
                    className="w-10 h-10 text-center bg-neutral-800 rounded-lg 
                         border border-neutral-700 text-white text-lg
                         focus:outline-none focus:border-neutral-600
                         transition-all duration-200"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {error && (
                <p className="text-red-400 text-xs mb-4 text-center animate-shake">
                  {error}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsVerifyingSettings(false);
                    setVerifyPin(["", "", "", ""]);
                    setError("");
                  }}
                  className="flex-1 py-2 text-sm text-white/60 hover:text-white/90
                       transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={verifySettingsAccess}
                  disabled={isLoading}
                  className="flex-1 py-2 bg-blue-500/20 text-blue-400 rounded
                       hover:bg-blue-500/30 disabled:opacity-50
                       transition-all duration-200"
                >
                  {isLoading ? "Verifying..." : "Proceed"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Verification Modal */}
        {showVerifyModal && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-neutral-900 p-6 rounded-lg w-72 border border-white/10">
              <h4 className="text-white/90 text-sm mb-4 text-center">
                Enter PIN to remove domain
              </h4>
              <div className="flex gap-2 mb-4 justify-center">
                {verifyPin.map((digit, index) => (
                  <input
                    key={index}
                    id={`verify-pin-${index}`}
                    type="password"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => {
                      const newPin = [...verifyPin];
                      newPin[index] = e.target.value;
                      setVerifyPin(newPin);
                    }}
                    className="w-10 h-10 text-center bg-neutral-800 rounded-lg 
                             border border-neutral-700 text-white text-lg
                             focus:outline-none focus:border-neutral-600"
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowVerifyModal(false)}
                  className="flex-1 py-2 text-sm text-white/60 hover:text-white/90"
                >
                  Cancel
                </button>
                <button
                  onClick={verifyAndRemove}
                  className="flex-1 py-2 bg-red-500/20 text-red-400 rounded
                           hover:bg-red-500/30 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
