"use client";

import { useState, useEffect, useCallback } from "react";

export interface Message {
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

import { API_URL as API_BASE_URL } from "@/lib/api";

const DEFAULT_SUGGESTIONS = [
  "🔍 Search for beach packages",
  "💸 Do you have tours under $2,000?",
  "💎 Recommend a luxury culture trip",
  "📅 Show my requested package list status"
];

const FOLLOWUP_SUGGESTIONS = [
  "💰 Make it cheaper",
  "⏱️ Suggest a shorter option",
  "🏔️ Show adventure alternatives",
  "📝 Help me request a custom itinerary"
];

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS);

  // Load chat history on mount
  const fetchHistory = useCallback(async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("travel_ai_token") : null;
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/api/ai/chat/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.history)) {
          setMessages(data.history);
          if (data.history.length > 0) {
            setSuggestions(FOLLOWUP_SUGGESTIONS);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadLogs = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("travel_ai_token") : null;
        if (!token) return;

        const res = await fetch(`${API_BASE_URL}/api/ai/chat/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok && mounted) {
          const data = await res.json();
          if (data.success && Array.isArray(data.history)) {
            setMessages(data.history);
            if (data.history.length > 0) {
              setSuggestions(FOLLOWUP_SUGGESTIONS);
            }
          }
        }
      } catch (err) {
        console.error("Failed mounting chat history:", err);
      }
    };
    loadLogs();
    return () => {
      mounted = false;
    };
  }, []);


  const clearHistory = useCallback(async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("travel_ai_token") : null;
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/api/ai/chat/history`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setMessages([]);
        setSuggestions(DEFAULT_SUGGESTIONS);
        setError(null);
      }
    } catch (err) {
      console.error("Failed to clear chat logs:", err);
      setError("Failed to clear conversation history.");
    }
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    setError(null);
    setIsPending(true);

    // 1. Instantly append User message to state
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);

    // 2. Add placeholder Assistant message that we can stream content into
    const assistantPlaceholder: Message = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantPlaceholder]);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("travel_ai_token") : null;

      if (!token) {
        throw new Error("Please log in to use the AI chat assistant.");
      }

      const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Session expired. Please log in again to continue chatting.");
        }
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Server returned HTTP ${res.status}.`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      if (!reader) {
        throw new Error("Response body is not readable.");
      }

      let accumulatedText = "";
      let done = false;

      // Loop to read stream chunks
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        
        if (value) {
          const chunkStr = decoder.decode(value, { stream: !done });
          accumulatedText += chunkStr;

          // Update the last messages array item (which is our placeholder assistant message)
          setMessages((prev) => {
            if (prev.length === 0) return prev;
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (updated[lastIdx].role === "assistant") {
              updated[lastIdx] = {
                ...updated[lastIdx],
                content: accumulatedText,
              };
            }
            return updated;
          });
        }
      }

      // Finish streaming, display dynamic follow-up guidelines
      setSuggestions(FOLLOWUP_SUGGESTIONS);
    } catch (err) {
      console.error("Chat communication stream failed:", err);
      const errMsg = err instanceof Error ? err.message : "An error occurred while streaming.";
      setError(errMsg);

      
      // Update the placeholder with error text so the traveler receives visual feedback
      setMessages((prev) => {
        if (prev.length === 0) return prev;
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (updated[lastIdx].role === "assistant" && !updated[lastIdx].content) {
          updated[lastIdx] = {
            ...updated[lastIdx],
            content: `⚠️ Failed to fetch stream response. (Error: ${errMsg})`,
          };
        }
        return updated;
      });
    } finally {
      setIsPending(false);
    }
  };

  return {
    messages,
    isPending,
    error,
    suggestions,
    sendMessage,
    clearHistory,
    refreshHistory: fetchHistory,
  };
}
