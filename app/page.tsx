'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Send, 
  Camera, 
  Paperclip, 
  Loader2, 
  Sparkles, 
  Trash2, 
  Copy, 
  Check,
  LogOut,
  User,
  Lock,
  Mail,
  Zap,
  LogIn,
  X
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  documentName?: string;
}

// Custom Infinity Void Logo Component
const InfinityVoidLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="infinityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#818CF8" />
        <stop offset="50%" stopColor="#C084FC" />
        <stop offset="100%" stopColor="#38BDF8" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    {/* Outer Glowing Infinity Loop */}
    <path
      d="M 30,50 C 15,30 15,70 30,50 C 45,30 55,70 70,50 C 85,30 85,70 70,50 C 55,30 45,70 30,50 Z"
      stroke="url(#infinityGradient)"
      strokeWidth="7"
      strokeLinecap="round"
      strokeLinejoin="round"
      filter="url(#glow)"
    />
    {/* Center Core Void Glow */}
    <circle cx="50" cy="50" r="5" fill="#FFFFFF" className="animate-ping" />
    <circle cx="50" cy="50" r="3" fill="#A855F7" />
  </svg>
);

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [documentBase64, setDocumentBase64] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setIsAuthLoading(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsAuthLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthMessage(null);

    if (authMode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setAuthError(error.message);
      } else {
        setAuthMessage('Account ban gaya hai! Ab aap Log In kar sakte hain.');
        setTimeout(() => setAuthMode('login'), 2000);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthError(error.message);
      } else {
        setShowAuthModal(false);
        setEmail('');
        setPassword('');
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => setDocumentBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() && !imageBase64 && !documentBase64) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      image: imageBase64 || undefined,
      documentName: documentName || undefined,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setImageBase64(null);
    setDocumentBase64(null);
    setDocumentName(null);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate response');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.content || "Namaste! Main Infinity Void AI hoon.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${error.message || 'Connection failed.'}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#090d16] text-white">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#070a12] text-slate-100 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] relative">
      
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60 bg-slate-950/40 backdrop-blur-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-2xl shadow-lg shadow-indigo-500/10">
            <InfinityVoidLogo className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide text-white flex items-center space-x-2">
              <span>Infinity Void AI</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono">v2.2 Stable</span>
            </h1>
            <p className="text-xs text-slate-400">Next-Gen Intelligence Workspace</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-full text-xs">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-slate-300 max-w-[150px] truncate">{user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 bg-slate-900 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 rounded-xl transition flex items-center space-x-1.5 text-xs"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl transition shadow-lg shadow-indigo-600/25 flex items-center space-x-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 max-w-4xl mx-auto w-full">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
              <div className="p-5 bg-slate-900/80 rounded-3xl border border-slate-800 relative shadow-2xl">
                <InfinityVoidLogo className="w-12 h-12" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Ready to explore the void?
              </h2>
              <p className="text-slate-400 max-w-sm text-sm">
                Ask anything, attach code files, analyze images, or test full-stack AI capabilities.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md w-full pt-2">
              <div className="p-3.5 bg-slate-900/40 border border-slate-800/80 rounded-2xl text-left hover:border-indigo-500/40 transition">
                <Zap className="w-4 h-4 text-indigo-400 mb-1.5" />
                <div className="text-xs font-medium text-white">Smart Vision & OCR</div>
                <div className="text-[11px] text-slate-500">Upload images for instant analysis</div>
              </div>
              <div className="p-3.5 bg-slate-900/40 border border-slate-800/80 rounded-2xl text-left hover:border-indigo-500/40 transition">
                <Paperclip className="w-4 h-4 text-purple-400 mb-1.5" />
                <div className="text-xs font-medium text-white">Doc Processing</div>
                <div className="text-[11px] text-slate-500">Read PDF, TXT and code files</div>
              </div>
            </div>
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
                <div className="p-2 bg-slate-900 border border-purple-500/30 rounded-xl text-white shadow-lg shadow-purple-500/20 mt-1">
                  <InfinityVoidLogo className="w-5 h-5" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-xl backdrop-blur-md ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none'
                    : 'bg-slate-900/80 border border-slate-800 text-slate-100 rounded-bl-none'
                }`}
              >
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="Uploaded preview"
                    className="mb-3 rounded-xl max-h-60 object-cover border border-white/10"
                  />
                )}
                {msg.documentName && (
                  <div className="mb-2 text-xs bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center space-x-2">
                    <Paperclip className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="truncate text-slate-300">{msg.documentName}</span>
                  </div>
                )}
                
                <div className="prose prose-invert text-sm leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>

                {msg.role === 'assistant' && msg.content && (
                  <div className="mt-3 flex items-center justify-end space-x-2 border-t border-slate-800/80 pt-2">
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
                <div className="p-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 shadow-md mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-900 border border-indigo-500/40 rounded-xl text-white">
              <InfinityVoidLogo className="w-5 h-5" />
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-3 flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span className="text-xs text-slate-400">Processing response...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-800/60 bg-slate-950/60 backdrop-blur-xl p-4">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex flex-col space-y-2">
          
          {(imageBase64 || documentName) && (
            <div className="flex items-center space-x-2 bg-slate-900 p-2 rounded-xl w-fit border border-slate-800">
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

          <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800/80 rounded-2xl px-4 py-2 focus-within:border-indigo-500/60 transition shadow-inner">
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
              placeholder="Ask Infinity Void AI..."
              className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 text-sm py-2"
            />

            <button
              type="submit"
              disabled={loading || (!input.trim() && !imageBase64 && !documentBase64)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800/50"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center mb-6">
              <div className="p-3 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-2xl shadow-lg shadow-purple-500/30 mb-3">
                <InfinityVoidLogo className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
              <p className="text-slate-400 text-xs mt-1">Sign in to save your workspace</p>
            </div>

            <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-6">
              <button
                onClick={() => { setAuthMode('login'); setAuthError(null); setAuthMessage(null); }}
                className={`py-2 text-xs font-medium rounded-xl transition ${
                  authMode === 'login' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Log In
              </button>
              <button
                onClick={() => { setAuthMode('signup'); setAuthError(null); setAuthMessage(null); }}
                className={`py-2 text-xs font-medium rounded-xl transition ${
                  authMode === 'signup' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1 block">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium mb-1 block">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              {authError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center">
                  {authError}
                </div>
              )}

              {authMessage && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-xs text-center">
                  {authMessage}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl text-sm transition shadow-lg shadow-indigo-600/25 mt-2"
              >
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}