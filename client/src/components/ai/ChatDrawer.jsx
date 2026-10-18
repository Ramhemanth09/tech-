import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Send,
  X,
  Bot,
  ArrowRight,
  ShieldCheck,
  Battery,
  AlertCircle,
  Clock,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { CitationChip } from './CitationChip.jsx';

export function ChatDrawer() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "👋 Hello! I'm your **Tech Shopping AI Assistant**.\n\nTell me what you are looking for (e.g. *\"I want a coding laptop under ₹45,000\"* or *\"Compare ThinkPad and Dell Latitude\"*). I'll find matching inventory, inspect disclosures, and redirect you directly to a side-by-side comparison!",
      citations: [],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [engineMode, setEngineMode] = useState('ai');
  const [countdown, setCountdown] = useState(null);
  const [pendingRedirectUrl, setPendingRedirectUrl] = useState(null);
  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  // Handle auto-redirect countdown
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      timerRef.current = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0 && pendingRedirectUrl) {
      handleProceedRedirect(pendingRedirectUrl);
    }
    return () => clearTimeout(timerRef.current);
  }, [countdown, pendingRedirectUrl]);

  const handleProceedRedirect = (url) => {
    clearTimeout(timerRef.current);
    setCountdown(null);
    setPendingRedirectUrl(null);
    setIsOpen(false);
    navigate(url);
  };

  const handleCancelRedirect = () => {
    clearTimeout(timerRef.current);
    setCountdown(null);
    setPendingRedirectUrl(null);
  };

  const executeQuery = async (queryText) => {
    if (!queryText.trim() || loading) return;

    handleCancelRedirect();
    const newMessages = [...messages, { role: 'user', content: queryText.trim() }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/api/buyer-chat', {
        messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
      });

      if (res.success && res.data?.message) {
        const assistantMsg = {
          role: 'assistant',
          content: res.data.message.content,
          citations: res.data.citations || [],
          action: res.data.action || null,
        };

        setMessages((prev) => [...prev, assistantMsg]);
        if (res.data.mode) setEngineMode(res.data.mode);

        // If the assistant gave a redirect action, prepare countdown
        if (res.data.action?.targetUrl) {
          setPendingRedirectUrl(res.data.action.targetUrl);
          setCountdown(3); // 3 second countdown before redirecting
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I ran into an issue finding products. Please try again.',
          citations: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    executeQuery(input);
  };

  return (
    <>
      {/* Floating Amazon-style Assistant Trigger at the bottom-right corner */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 group">
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-1.5 bg-[#131921] text-white text-xs font-semibold py-2 px-3.5 rounded-full shadow-xl border border-amber-500/30 cursor-pointer hover:border-amber-400 transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Ask Tech AI Assistant</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-[#131921] via-[#232f3e] to-[#febd69] p-0.5 shadow-2xl flex items-center justify-center transition-all hover:scale-105 focus:outline-none"
          aria-label="Open AI Shopping Assistant"
        >
          <div className="w-full h-full bg-[#131921] rounded-full flex items-center justify-center text-white relative">
            <Sparkles className="w-6 h-6 text-[#febd69]" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-900 text-[10px] font-black rounded-full flex items-center justify-center shadow">
              AI
            </span>
          </div>
        </button>
      </div>

      {/* Slide-out Amazon-style Assistant Drawer */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-slide-left">
          {/* Header */}
          <div className="p-4 bg-[#131921] text-white flex items-center justify-between border-b border-[#232f3e]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#febd69] text-slate-900 flex items-center justify-center font-black shadow">
                <Bot className="w-5 h-5 text-slate-900" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white tracking-tight">TechCompanion AI</h3>
                  <span className="bg-amber-400/20 text-[#febd69] text-[10px] font-bold px-1.5 py-0.2 rounded border border-amber-400/30">
                    Assistant
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${engineMode === 'ai' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                  <span>Instant product discovery & comparison</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Starter Suggestions */}
          <div className="bg-[#f0f2f2] px-3 py-2 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <span className="text-slate-500 font-bold shrink-0">Try:</span>
            <button
              onClick={() => executeQuery('I want a coding laptop under ₹45,000')}
              className="bg-white hover:bg-amber-50 hover:border-amber-400 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200 whitespace-nowrap transition-colors"
            >
              💻 Coding laptop under ₹45k
            </button>
            <button
              onClick={() => executeQuery('Compare ThinkPad T480 vs Dell Latitude 7490')}
              className="bg-white hover:bg-amber-50 hover:border-amber-400 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200 whitespace-nowrap transition-colors"
            >
              🔍 Compare ThinkPad vs Latitude
            </button>
            <button
              onClick={() => executeQuery('Show me cameras with low shutter count')}
              className="bg-white hover:bg-amber-50 hover:border-amber-400 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200 whitespace-nowrap transition-colors"
            >
              📷 Cameras with verified shutter
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-[#f8fafc]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-[#131921] text-[#febd69] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl max-w-[88%] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#232f3e] text-white rounded-br-none shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-line text-xs font-normal">{msg.content}</div>

                  {/* If action with matched products exists */}
                  {msg.action?.matchedProducts?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-2.5">
                      <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                        <span>Matched Inventory ({msg.action.matchedProducts.length})</span>
                        <span className="text-emerald-700 font-semibold text-[10px]">Ready to Compare</span>
                      </div>

                      {/* Mini Product Cards Preview */}
                      <div className="space-y-2">
                        {msg.action.matchedProducts.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
                          >
                            <img
                              src={p.image || 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200'}
                              alt={p.title}
                              className="w-12 h-12 object-cover rounded bg-white border border-slate-200 shrink-0"
                            />
                            <div className="flex-1 min-w-0 text-[11px]">
                              <div className="font-bold truncate text-slate-900">{p.title}</div>
                              <div className="text-amber-700 font-black text-xs">₹{p.price.toLocaleString()}</div>
                              <div className="text-[10px] text-slate-500 flex items-center gap-2">
                                <span>{p.ramGb ? `${p.ramGb}GB RAM` : p.brand}</span>
                                <span>•</span>
                                <span className={p.batteryHealth ? 'text-emerald-600 font-semibold' : 'text-amber-600'}>
                                  {p.batteryHealth ? `${p.batteryHealth}% Battery` : 'Battery Undisclosed'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Big Action Redirect Button */}
                      <div className="pt-1 space-y-1.5">
                        <button
                          onClick={() => handleProceedRedirect(msg.action.targetUrl)}
                          className="w-full bg-[#febd69] hover:bg-[#f3a847] text-slate-950 font-bold py-2.5 px-3 rounded-lg shadow-md flex items-center justify-center gap-2 text-xs transition-all border border-amber-400"
                        >
                          <Layers className="w-4 h-4 text-slate-900" />
                          <span>{msg.action.buttonText || 'Compare Matching Products Side-by-Side'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>

                        {countdown !== null && pendingRedirectUrl === msg.action.targetUrl && (
                          <div className="flex items-center justify-between text-[10px] text-slate-500 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                            <span className="flex items-center gap-1 font-semibold text-amber-900">
                              <Clock className="w-3 h-3 text-amber-700 animate-spin" />
                              Auto-redirecting in {countdown}s...
                            </span>
                            <button
                              onClick={handleCancelRedirect}
                              className="text-slate-600 hover:text-slate-900 underline font-semibold"
                            >
                              Stay on chat
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Render citations if attached */}
                  {msg.citations?.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Grounded Sources:</div>
                      <div className="flex flex-wrap gap-1">
                        {msg.citations.map((c, idx) => (
                          <CitationChip key={idx} citation={c} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 text-slate-600 text-xs shadow-sm">
                <Sparkles className="w-4 h-4 animate-spin text-amber-500" />
                <span>Searching active inventory and calculating trade-offs...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input form */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. I want a laptop for coding under 45k..."
              className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-[#febd69] hover:bg-[#f3a847] disabled:opacity-50 text-slate-900 px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center transition-colors shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
