"use client";

import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

function formatMessageContent(content: string) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let currentTable: { headers: string[]; rows: string[][] } | null = null;

  const parseInlineStyles = (text: string) => {
    // Parse bold text: **text**
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <strong key={index} className="font-bold text-neutral-900 dark:text-white">
            {part}
          </strong>
        );
      }
      // Parse code text: `code`
      const subParts = part.split(/`([^`]+)`/g);
      return subParts.map((subPart, subIndex) => {
        if (subIndex % 2 === 1) {
          return (
            <code
              key={subIndex}
              className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold"
            >
              {subPart}
            </code>
          );
        }
        return subPart;
      });
    });
  };

  const flushTable = (key: number) => {
    if (!currentTable) return null;
    const tableEl = (
      <div key={`table-${key}`} className="my-3 overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
        <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
          <thead className="bg-neutral-50 dark:bg-neutral-900">
            <tr>
              {currentTable.headers.map((h, i) => (
                <th key={i} className="px-3 py-2 text-left font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 bg-white dark:bg-neutral-950">
            {currentTable.rows.map((row, ri) => (
              <tr key={ri} className="hover:bg-neutral-50/50">
                {row.map((val, ci) => (
                  <td key={ci} className="px-3 py-2 text-neutral-800 dark:text-neutral-200 whitespace-nowrap">
                    {parseInlineStyles(val)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    currentTable = null;
    return tableEl;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("|")) {
      const cells = trimmed
        .split("|")
        .map((c) => c.trim())
        .filter((_, i, arr) => i > 0 && i < arr.length - 1);

      if (cells.every((c) => c.startsWith("-"))) {
        return;
      }

      if (!currentTable) {
        currentTable = { headers: cells, rows: [] };
      } else {
        currentTable.rows.push(cells);
      }
      return;
    }

    if (currentTable && !trimmed.startsWith("|")) {
      const table = flushTable(index);
      if (table) elements.push(table);
    }

    if (trimmed.startsWith("#")) {
      const level = trimmed.match(/^#+/)?.[0].length || 1;
      const text = trimmed.replace(/^#+\s*/, "");
      const className =
        level === 1
          ? "text-base font-bold font-fraunces text-neutral-900 dark:text-white mt-3 mb-1"
          : "text-sm font-bold font-fraunces text-neutral-850 dark:text-neutral-100 mt-2 mb-1";
      elements.push(
        <div key={index} className={className}>
          {parseInlineStyles(text)}
        </div>
      );
      return;
    }

    if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
      const text = trimmed.replace(/^[-*]\s*/, "");
      elements.push(
        <div key={index} className="flex gap-2 text-sm pl-2 my-1 text-neutral-700 dark:text-neutral-300">
          <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
          <span className="flex-1 leading-relaxed">{parseInlineStyles(text)}</span>
        </div>
      );
      return;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const indexStr = trimmed.match(/^\d+\./)?.[0] || "";
      const text = trimmed.replace(/^\d+\.\s*/, "");
      elements.push(
        <div key={index} className="flex gap-2 text-sm pl-2 my-1 text-neutral-700 dark:text-neutral-300">
          <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold">{indexStr}</span>
          <span className="flex-1 leading-relaxed">{parseInlineStyles(text)}</span>
        </div>
      );
      return;
    }

    if (!trimmed) {
      elements.push(<div key={index} className="h-2" />);
      return;
    }

    elements.push(
      <p key={index} className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed my-1">
        {parseInlineStyles(line)}
      </p>
    );
  });

  if (currentTable) {
    const table = flushTable(lines.length);
    if (table) elements.push(table);
  }

  return elements;
}

export default function ChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const { messages, isPending, error, suggestions, sendMessage, clearHistory } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Automatically scroll to bottom of chat list
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isPending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isPending) return;
    sendMessage(inputVal.trim());
    setInputVal("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (isPending) return;
    const cleanText = suggestion.replace(/^[^a-zA-Z0-9]+/, "").trim();
    sendMessage(cleanText);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Conversation Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-[90vw] sm:w-[420px] h-[550px] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-neutral-200/60 dark:border-zinc-800/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden mb-4"
          >
            {/* Gradient Premium Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white px-5 py-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="bg-white/20 p-2 rounded-xl">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 block h-3 w-3 rounded-full bg-emerald-400 border-2 border-indigo-700 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm leading-tight tracking-tight">Travel AI Concierge</h3>
                  <span className="text-[10px] text-indigo-200 font-medium font-mono uppercase tracking-wider">Online Advisor</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {user && messages.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm("Reset conversation logs history?")) clearHistory();
                    }}
                    title="Clear history logs"
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-indigo-100 hover:text-white"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-9v13m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-indigo-100 hover:text-white"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Conversation Window Body */}
            {!user ? (
              <div className="flex-1 flex flex-col justify-center items-center p-8 text-center space-y-4">
                <div className="bg-indigo-50 dark:bg-indigo-950/40 p-4 rounded-full text-indigo-600 dark:text-indigo-400">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h4 className="font-fraunces text-lg font-bold text-neutral-900 dark:text-white">AI Travel Concierge</h4>
                <p className="text-neutral-500 text-xs max-w-xs leading-relaxed">
                  Log in to query package options, compare destinations, check your details, and plan custom premium itineraries.
                </p>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  Sign In to Start Chat
                </Link>
              </div>
            ) : (
              <>
                {/* Chat Message Scroll view */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-neutral-50/50 dark:bg-zinc-950/20">
                  {messages.length === 0 && (
                    <div className="h-full flex flex-col justify-center items-center text-center p-6 space-y-2.5">
                      <div className="bg-white dark:bg-zinc-800 border border-neutral-100 dark:border-zinc-800 p-3.5 rounded-2xl shadow-sm text-neutral-400">
                        <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-sm text-neutral-800 dark:text-neutral-200">How can I help you?</h4>
                      <p className="text-[11px] text-neutral-500 max-w-[240px]">
                        Ask about weather inside destinations, request budget lists, compare itineraries, or inquire about booking statuses.
                      </p>
                    </div>
                  )}

                  {messages.map((msg, i) => {
                    const isUser = msg.role === "user";
                    return (
                      <div
                        key={i}
                        className={`flex ${isUser ? "justify-end" : "justify-start"} items-start gap-2.5`}
                      >
                        {!isUser && (
                          <div className="bg-indigo-600 text-white p-1 rounded-lg text-xs mt-0.5 flex-shrink-0">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                          </div>
                        )}
                        <div
                          className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                            isUser
                              ? "bg-indigo-600 text-white rounded-tr-none font-medium"
                              : "bg-white dark:bg-zinc-800 dark:text-neutral-100 text-neutral-900 border border-neutral-100 dark:border-zinc-800 rounded-tl-none"
                          }`}
                        >
                          {isUser ? msg.content : formatMessageContent(msg.content)}
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing Dots Indicator */}
                  {isPending && (messages.length === 0 || messages[messages.length - 1].role !== "assistant" || !messages[messages.length - 1].content) && (
                    <div className="flex justify-start items-center gap-2.5">
                      <div className="bg-indigo-600 text-white p-1 rounded-lg text-xs flex-shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                      <div className="bg-white dark:bg-zinc-800 border border-neutral-100 dark:border-zinc-800 px-4 py-3 rounded-2xl rounded-tl-none flex items-center space-x-1 shadow-sm">
                        <span className="w-1.5 h-1.5 bg-indigo-600/60 dark:bg-indigo-400/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-indigo-600/70 dark:bg-indigo-400/70 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-indigo-600/80 dark:bg-indigo-400/80 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  )}

                  {/* Error Notification inside panel */}
                  {error && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400 hover:text-rose-900 border border-rose-100/50 rounded-2xl text-[11px] text-center">
                      ⚠️ {error}
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Suggestions pill blocks */}
                {suggestions.length > 0 && (
                  <div className="px-4 py-2 border-t border-neutral-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70">
                    <div className="flex flex-wrap gap-1.5">
                      {suggestions.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSuggestionClick(s)}
                          disabled={isPending}
                          className="bg-neutral-50 hover:bg-neutral-100/80 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 text-[10px] text-neutral-600 dark:text-neutral-300 font-semibold px-2.5 py-1.5 border border-neutral-200/50 dark:border-zinc-700/50 rounded-lg cursor-pointer transition-colors active:scale-97 select-none whitespace-nowrap"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* User Message Input Form */}
                <form
                  onSubmit={handleSubmit}
                  className="p-3 border-t border-neutral-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder="Type a travel preference request..."
                    disabled={isPending}
                    className="flex-1 bg-neutral-50 dark:bg-zinc-800 px-4 py-2.5 text-xs text-neutral-900 dark:text-white rounded-xl placeholder-neutral-400 border border-neutral-200/40 dark:border-zinc-800 focus:outline-none focus:ring-1.5 focus:ring-indigo-600/30 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={isPending || !inputVal.trim()}
                    className={`p-2.5 rounded-xl cursor-pointer text-white transition-all shadow-sm ${
                      isPending || !inputVal.trim()
                        ? "bg-neutral-300 dark:bg-zinc-800 text-neutral-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 active:scale-95"
                    }`}
                  >
                    <svg className="w-4 h-4 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Circle Floating Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`h-14 w-14 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-all border border-indigo-500/20 relative ${
          isOpen ? "" : "animate-pulse"
        }`}
      >
        <span className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping opacity-75" />
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.svg
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-6 h-6 relative z-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </motion.svg>
          ) : (
            <motion.svg
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-6 h-6 relative z-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
