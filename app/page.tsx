"use client";

import React, { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "🌌 Welcome to Infinity Void AI. My cosmic sensors are fully synchronized with real-time date, day, and time. How may I guide you through the void today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // 1. Precise Real-Time Date, Day, and Time extraction
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    const currentDateTimeString = now.toLocaleDateString('en-IN', options);

    const userMessage = input.trim();
    setInput("");
    
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      // 2. Injecting real-time context dynamically into prompt
      const enhancedPrompt = `[System Context: Current local Date, Day and Time is ${currentDateTimeString}]. User Query: ${userMessage}`;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: enhancedPrompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch response.");
      }

      const aiReply = data.text || data.reply || "Cosmic signal lost.";
      
      setMessages((prev) => [...prev, { role: "assistant", content: aiReply }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Spatial anomaly detected. Unable to reach the AI core right now.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white font-sans antialiased overflow-hidden relative selection:bg-purple-500 selection:text-white">
      
      {/* Cosmic Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-purple-900/30 bg-black/60 backdrop-blur-xl z-20 shadow-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 p-[2px] shadow-[0_0_20px_rgba(168,85,247,0.5)]">
            <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">∞</span>
            </div>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-widest bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
              INFINITY VOID AI
            </h1>
            <p className="text-[10px] text-cyan-400 tracking-widest uppercase flex items-center gap-1.5 font-semibold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              Real-Time Chrono-Sync Active
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages([{ role: "assistant", content: "✨ Memory reset successfully. Enter the void anew." }])}
          className="px-3.5 py-1.5 text-xs bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/40 rounded-xl text-purple-200 transition shadow-lg active:scale-95"
        >
          Clear Memory
        </button>
      </header>

      {/* CHAT CONTAINER */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 max-w-4xl w-full mx-auto z-10 scrollbar-thin">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-3.5 ${
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold shrink-0 shadow-lg ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                  : "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              }`}
            >
              {msg.role === "user" ? "YOU" : "AI"}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[78%] sm:max-w-[82%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-xl backdrop-blur-md ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none shadow-purple-900/20"
                  : "bg-gray-900/85 border border-purple-900/30 text-gray-100 rounded-tl-none"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-2xl bg-cyan-600 flex items-center justify-center text-xs font-bold text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              AI
            </div>
            <div className="bg-gray-900/85 border border-purple-900/30 px-5 py-3.5 rounded-2xl rounded-tl-none text-gray-400 text-sm flex items-center gap-2.5 backdrop-blur-md shadow-xl">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-pink-400 animate-bounce [animation-delay:0.4s]"></span>
              <span className="ml-1 text-xs tracking-wider text-purple-300 font-medium">Consulting cosmic timeline...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT FORM FOOTER */}
      <footer className="p-4 bg-black/70 border-t border-purple-900/30 backdrop-blur-xl z-20 shadow-2xl">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about anything, time, day, or space..."
            className="flex-1 bg-gray-950/90 border border-purple-900/50 rounded-2xl px-5 py-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition shadow-inner"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className={`px-7 py-4 rounded-2xl font-semibold text-sm transition flex items-center justify-center shadow-xl ${
              loading || !input.trim()
                ? "bg-gray-900 text-gray-600 cursor-not-allowed border border-gray-800"
                : "bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white shadow-[0_0_25px_rgba(168,85,247,0.5)] active:scale-95"
            }`}
          >
            Transmit
          </button>
        </form>
        <p className="text-center text-[10px] text-gray-500 mt-2.5 tracking-wider">
          Infinity Void AI PWA • Real-Time Enabled
        </p>
      </footer>
    </div>
  );
}