"use client";

import { useState } from "react";

export default function ChatModal({ onClose }) {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    const userMessage = { sender: "user", text: message };
    setChatHistory([...chatHistory, userMessage]);
    setLoading(true);
    try {
      // Retrieve the JWT token from localStorage (or your auth provider)
      const token = localStorage.getItem("token");
      
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Pass the token in the Authorization header
          "Authorization": token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ message }), // Only the user's message is sent; backend adds context.
      });
      const data = await res.json();
      const botMessage = { sender: "bot", text: data.answer };
      setChatHistory((prev) => [...prev, botMessage]);
    } catch (error) {
      setChatHistory((prev) => [
        ...prev,
        { sender: "bot", text: "Error: Unable to fetch response" },
      ]);
    }
    setMessage("");
    setLoading(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        borderTop: "1px solid #ccc",
        padding: "1rem",
        zIndex: 1000,
      }}
    >
      <button onClick={onClose} style={{ float: "right", marginBottom: "1rem" }}>
        Close
      </button>
      <div style={{ maxHeight: "300px", overflowY: "auto", marginBottom: "1rem" }}>
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            style={{
              textAlign: msg.sender === "bot" ? "left" : "right",
              marginBottom: "0.5rem",
            }}
          >
            <strong>{msg.sender === "bot" ? "Bot" : "You"}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div style={{ display: "flex" }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          style={{ flex: 1, padding: "0.5rem" }}
        />
        <button onClick={handleSend} disabled={loading} style={{ padding: "0.5rem 1rem" }}>
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
