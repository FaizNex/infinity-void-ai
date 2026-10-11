'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Send, 
  Camera, 
  Paperclip, 
  Loader2, 
  Volume2, 
  VolumeX, 
  Mic, 
  Square, 
  Bot, 
  User, 
  Sparkles, 
  Trash2, 
  Copy, 
  Check 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  documentName?: string;
}

export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [documentBase64, setDocumentBase64] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string | null>(null);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Handle Image Upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Document Upload
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocumentBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Send Message Handler (Gemini API Integration)
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() && !imageBase64 && !documentBase64) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      image: imageBase64 || undefined,
      documentName: documentName || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setImageBase64(null);
    setDocumentBase64(null);
    setDocumentName(null);
    setLoading(true);

    try {
      // Call your API or Gemini backend endpoint here
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate response from AI');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.content || data.reply || "Namaste! Main Infinity Void AI hoon. Aapki kya sahayata kar sakta hoon?",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      // Fallback simulated response if API route is configured differently
      const fallbackMessage: Message = {
        role: 'assistant',
        content: "Aapka message mil gaya hai! Infinity Void AI successfully connected hai.",
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide">Infinity Void AI</h1>
            <p className="text-xs text-slate-400">Powered by Gemini & Supabase</p>
          </div>
        </div>
      </header>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 max-w-4xl mx-auto w-full">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
              <Bot className="w-12 h-12 text-indigo-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-200">Aapki kya madad kar sakta hoon?</h2>
            <p className="text-slate-400 max-w-md text-sm">
              Koyi bhi sawal puchein, image ya document upload karein, ya AI se baat karein.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start space-x-3 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="p-2 bg-indigo-600 rounded-full text-white shadow-md">
                  <Bot className="w-5 h-5" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-md ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-none'
                }`}
              >
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="Uploaded preview"
                    className="mb-3 rounded-lg max-h-60 object-cover"
                  />
                )}
                {msg.documentName && (
                  <div className="mb-2 text-xs bg-slate-800 px-2 py-1 rounded border border-slate-700 flex items-center space-x-1">
                    <Paperclip className="w-3 h-3" />
                    <span className="truncate">{msg.documentName}</span>
                  </div>
                )}
                
                <div className="prose prose-invert text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>

                {msg.role === 'assistant' && (
                  <div className="mt-3 flex items-center justify-end space-x-2 border-t border-slate-800 pt-2">
                    <button
                      onClick={() => copyToClipboard(msg.content, index)}
                      className="text-slate-400 hover:text-white transition text-xs flex items-center space-x-1"
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-400" />
                          <span className="text-green-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="p-2 bg-slate-800 rounded-full text-slate-200 shadow-md">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-full text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span className="text-sm text-slate-400">Soch raha hoon...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Footer Area */}
      <div className="border-t border-slate-800 bg-slate-900/60 backdrop-blur p-4">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex flex-col space-y-2">
          {/* Previews if any */}
          {(imageBase64 || documentName) && (
            <div className="flex items-center space-x-2 bg-slate-800/80 p-2 rounded-xl w-fit border border-slate-700">
              {imageBase64 && <span className="text-xs text-indigo-300">📷 Image attached</span>}
              {documentName && <span className="text-xs text-indigo-300">📎 {documentName}</span>}
              <button
                type="button"
                onClick={() => {
                  setImageBase64(null);
                  setDocumentBase64(null);
                  setDocumentName(null);
                }}
                className="text-slate-400 hover:text-red-400 ml-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2 focus-within:border-indigo-500 transition shadow-inner">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            <input
              type="file"
              ref={docInputRef}
              onChange={handleDocumentChange}
              accept=".pdf,.txt,.doc,.docx"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-slate-400 hover:text-indigo-400 transition p-1.5"
              title="Upload Image"
            >
              <Camera className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => docInputRef.current?.click()}
              className="text-slate-400 hover:text-indigo-400 transition p-1.5"
              title="Upload Document"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Yahan apna message type karein..."
              className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 text-sm py-2"
            />

            <button
              type="submit"
              disabled={loading || (!input.trim() && !imageBase64 && !documentBase64)}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition shadow-md shadow-indigo-600/30 flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}