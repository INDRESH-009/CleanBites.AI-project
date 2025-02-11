"use client";

import { useState, useEffect, useRef } from "react";
import { Bot, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ChatModal({ onClose }) {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive.
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [chatHistory]);

  /**
   * handleSend accepts an optional second parameter "prebuiltText".
   * If provided, it immediately sends that text; otherwise, it uses the value from state.
   */
  const handleSend = async (e, prebuiltText) => {
    if (e) e.preventDefault();
    const textToSend = prebuiltText !== undefined ? prebuiltText : message;
    if (!textToSend.trim()) return;

    // Add the user's message to the chat history.
    setChatHistory((prev) => [...prev, { sender: "user", text: textToSend }]);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ message: textToSend }),
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

    // Clear the input only if the user typed the message.
    if (prebuiltText === undefined) setMessage("");
    setLoading(false);
  };

  return (
    <Card
      /* 
        Make card flex-col so header is top, content is middle (scrollable),
        and footer is at the bottom. 
        Also handle responsiveness for mobile vs. desktop.
      */
      className="
        z-30
        fixed 
        bottom-2 
        right-2 
        sm:bottom-6 
        sm:right-6 
        flex 
        flex-col 
        w-[90vw] 
        h-[90vh] 
        sm:w-[440px] 
        sm:h-[600px] 
        bg-background/95 
        backdrop-blur 
        supports-[backdrop-filter]:bg-background/60
      "
    >
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <span className="font-semibold text-lg">Chat</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </CardHeader>

      {/* 
        CardContent is the middle, scrollable section.
        We give it flex-1 so it expands to fill remaining space, 
        then inside we have a ScrollArea for the chat messages.
      */}
      <CardContent className="p-4 pt-0 flex-1 flex flex-col">
        <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4 flex flex-col justify-end">
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`mb-4 flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-2xl px-4 py-2 max-w-[85%] text-sm ${
                  msg.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <strong>{msg.sender === "bot" ? "Bot:" : "You:"}</strong> {msg.text}
              </div>
            </div>
          ))}

          {/* Loading Animation */}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-muted px-4 py-2 text-sm">
                <div className="flex gap-2">
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-foreground/50"
                    style={{ animationDelay: "-0.3s" }}
                  />
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-foreground/50"
                    style={{ animationDelay: "-0.15s" }}
                  />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/50" />
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/*
        CardFooter is pinned at the bottom of the card 
        because the card is flex-col and CardContent took up remaining space.
      */}
      <CardFooter className="p-4 pt-2 flex flex-col items-center gap-2">
        {/* Sample Questions Above the Input */}
        <div className="flex justify-center gap-2 w-full">
          <button
            onClick={() => handleSend(null, "What’s a healthy portion?")}
            className="px-3 py-1 text-sm bg-gray-700 text-white rounded-full hover:bg-gray-600 transition"
          >
            What’s a healthy portion?
          </button>
          <button
            onClick={() => handleSend(null, "Suggest a healthy recipe")}
            className="px-3 py-1 text-sm bg-gray-700 text-white rounded-full hover:bg-gray-600 transition"
          >
            Suggest a healthy recipe
          </button>
        </div>

        {/* Chat Input and Send Button */}
        <form onSubmit={(e) => handleSend(e)} className="flex w-full items-center space-x-2">
          <Input
            id="message"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 bg-background"
            disabled={loading}
          />
          <Button type="submit" size="icon" disabled={loading || !message.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
