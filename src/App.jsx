import React from "react";
import "./App.css";

const App = () => {
  return (
    <div
      style={{
        width: "300px", // Set fixed width for popup
        height: "400px", // Set fixed height for popup
        padding: "20px",
        textAlign: "center",
        fontFamily: "Arial",
        backgroundColor: "#ffffff", // Add background color
      }}
    >
      <h1>Hello, SAMAY VED!</h1>
      <p>This is a React-based Chrome extension popup.</p>
    </div>
  );
};

export default App;
