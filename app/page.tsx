'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Camera, Paperclip, Loader2, Volume2, VolumeX, Mic, MicOff, FileText, X } from 'lucide-react';
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Fetch Chat History from Supabase on Page Load
  useEffect(() => {
    async function loadChatHistory() {
      const { data, error } = await supabase
        .from('chats')
        .select('role, content')
        .order('created_at', { ascending: true });

      if (data && data.length > 0) {
        setMessages(data as Message[]);
      }
    }
    loadChatHistory();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Voice Input (Mic)
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Aapke browser mein Voice Input supported nahi hai. Kripya Chrome use karein.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Voice Output
  const handleSpeak = (text: string, index: number) => {
    if ('speechSynthesis' in window) {
      if (speakingIndex === index) {
        window.speechSynthesis.cancel();
        setSpeakingIndex(null);
      } else {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        
        const selectedVoice = voices.find(
          (voice) =>
            (voice.lang === 'en-IN' || voice.lang === 'hi-IN') &&
            (voice.name.toLowerCase().includes('female') ||
             voice.name.toLowerCase().includes('raveena') ||
             voice.name.toLowerCase().includes('heera') ||
             voice.name.toLowerCase().includes('zira') ||
             voice.name.toLowerCase().includes('google'))
        ) || voices.find((voice) => voice.lang === 'en-IN' || voice.lang === 'hi-IN') || voices[0];

        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        utterance.rate = 1.0;
        utterance.pitch = 1.1;

        utterance.onend = () => setSpeakingIndex(null);
        setSpeakingIndex(index);
        window.speechSynthesis.speak(utterance);
      }
    }
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

  // Send Message & Save to Supabase
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !imageBase64 && !documentBase64) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      image: imageBase64 || undefined,
      documentName: documentName || undefined,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');

    // Save User message to Supabase
    await supabase.from('chats').insert([{ role: 'user', content: userMessage.content }]);

    const currentImage = imageBase64;
    const currentDoc = documentBase64;
    const currentDocName = documentName;

    setImageBase64(null);
    setDocumentBase64(null);
    setDocumentName(null);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          imageBase64: currentImage,
          documentBase64: currentDoc,
          documentName: currentDocName,
        }),
      });

      const data = await response.json();
      if (data.reply) {
        const assistantMsg: Message = { role: 'assistant', content: data.reply };
        setMessages((prev) => [...prev, assistantMsg]);

        // Save AI reply to Supabase
        await supabase.from('chats').insert([{ role: 'assistant', content: data.reply }]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur flex items-center justify-between">
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Infinity Void AI
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto w-full">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <p className="text-lg text-center">
              Main Infinity Void AI hoon. Main aapki kya madad kar sakta hoon?
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md relative group ${
              msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
            }`}>
              {msg.image && <img src={msg.image} alt="Uploaded" className="max-h-60 rounded-lg mb-2 object-contain" />}
              {msg.documentName && (
                <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-1.5 rounded-lg mb-2 text-xs text-cyan-300">
                  <FileText className="w-4 h-4" />
                  <span>{msg.documentName}</span>
                </div>
              )}
              {msg.role === 'assistant' ? (
                <div className="prose prose-invert max-w-none text-sm leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              )}
              {msg.role === 'assistant' && (
                <button
                  onClick={() => handleSpeak(msg.content, idx)}
                  className="mt-2 text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1 text-xs"
                >
                  {speakingIndex === idx ? <><VolumeX className="w-4 h-4 text-red-400" /> Stop</> : <><Volume2 className="w-4 h-4" /> Listen</>}
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Infinity Void AI soch raha hai...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <footer className="p-4 border-t border-slate-800 bg-slate-900/80">
        <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex flex-col gap-2">
          <div className="flex gap-2">
            {imageBase64 && (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-cyan-500">
                <img src={imageBase64} alt="Preview" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setImageBase64(null)} className="absolute top-0 right-0 bg-red-600 text-white p-0.5 text-xs rounded-bl">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {documentName && (
              <div className="relative flex items-center gap-2 bg-slate-800 border border-cyan-500 px-3 py-1.5 rounded-lg text-xs text-cyan-300">
                <FileText className="w-4 h-4" />
                <span className="max-w-[150px] truncate">{documentName}</span>
                <button type="button" onClick={() => { setDocumentBase64(null); setDocumentName(null); }} className="text-red-400 hover:text-red-300 ml-1">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 focus-within:border-cyan-500">
            <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageChange} className="hidden" />
            <button type="button" onClick={() => imageInputRef.current?.click()} className="text-slate-400 hover:text-cyan-400 p-1">
              <Camera className="w-5 h-5" />
            </button>

            <input type="file" accept=".pdf,.txt,.csv,.doc,.docx" ref={docInputRef} onChange={handleDocumentChange} className="hidden" />
            <button type="button" onClick={() => docInputRef.current?.click()} className="text-slate-400 hover:text-cyan-400 p-1">
              <Paperclip className="w-5 h-5" />
            </button>

            <button type="button" onClick={toggleListening} className={`p-1 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-cyan-400'}`}>
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? 'Listening...' : 'Ask in Hinglish...'}
              className="flex-1 bg-transparent text-sm focus:outline-none text-slate-100 placeholder-slate-500"
            />

            <button type="submit" disabled={loading || (!input.trim() && !imageBase64 && !documentBase64)} className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-semibold p-2 rounded-lg disabled:opacity-50">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}