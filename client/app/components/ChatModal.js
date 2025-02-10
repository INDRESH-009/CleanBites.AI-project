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

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chat`, {
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
        bottom: "1rem",
        left: "50%",
        transform: "translateX(-50%)",
        width: "90%",
        maxWidth: "600px",
        backgroundColor: "#f4f4f4",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        padding: "1rem",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
          borderBottom: "1px solid #ddd",
          paddingBottom: "0.5rem",
        }}
      >
        <h2 style={{ margin: 0, color: "#333", fontSize: "1.25rem" }}>Chat</h2>
        <button
          onClick={onClose}
          style={{
            backgroundColor: "#e74c3c",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            padding: "0.5rem 1rem",
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>
      <div
        style={{
          flexGrow: 1,
          overflowY: "auto",
          marginBottom: "1rem",
          padding: "0.75rem",
          backgroundColor: "#fff",
          border: "1px solid #ddd",
          borderRadius: "4px",
          maxHeight: "300px",
        }}
      >
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            style={{
              textAlign: msg.sender === "bot" ? "left" : "right",
              marginBottom: "0.75rem",
            }}
          >
            <div
              style={{
                display: "inline-block",
                backgroundColor: msg.sender === "bot" ? "#ecf0f1" : "#3498db",
                color: msg.sender === "bot" ? "#2c3e50" : "#fff",
                padding: "0.5rem 0.75rem",
                borderRadius: "12px",
                maxWidth: "80%",
                wordBreak: "break-word",
              }}
            >
              <strong>{msg.sender === "bot" ? "Bot" : "You"}:</strong>{" "}
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: "0.75rem",
            fontSize: "1rem",
            border: "1px solid #ddd",
            borderRadius: "4px",
            marginRight: "0.5rem",
            outline: "none",
            color: "#333",
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          style={{
            padding: "0.75rem 1.25rem",
            fontSize: "1rem",
            backgroundColor: "#27ae60",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
