"use client";

import { useState, type KeyboardEvent } from "react";

interface Message {
  role: "user" | "bot";
  content: string;
}

interface PerplexityResponse {
  results: { snippet: string }[];
}

export default function PerplexityChatbot() {
  const [open, setOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const toggleChat = () => setOpen((prev) => !prev);

  const handleSend = async () => {
    if (!query.trim()) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/chatbot?query=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Failed to fetch research data");

      const data = (await response.json()) as PerplexityResponse;

      const botMessage = data.results?.[0]?.snippet ?? "No relevant insights found.";

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "user", content: query },
        { role: "bot", content: botMessage },
      ]);
    } catch (error) {
      console.error("Error fetching research data:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "bot", content: "Error retrieving insights. Please try again." },
      ]);
    } finally {
      setQuery("");
      setLoading(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") void handleSend();
  };

  return (
    <div>
      {/* Floating Chatbot Button */}
      <button
        className="fixed bottom-5 right-5 rounded-full bg-blue-600 p-3 text-white shadow-lg hover:bg-blue-700"
        onClick={toggleChat}
      >
        💬
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-20 right-5 flex h-96 w-80 flex-col rounded-lg bg-white p-4 shadow-lg">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-lg font-bold">Squad AI Research</h2>
            <button className="text-gray-500" onClick={toggleChat}>
              ✖
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`my-1 rounded p-2 ${msg.role === "user" ? "bg-gray-200 text-right" : "bg-blue-100"}`}
                >
                  {msg.content}
                </div>
              ))
            ) : (
              <p className="text-gray-500">Ask about squad health, leadership, or improvements...</p>
            )}
          </div>

          <div className="border-t pt-2">
            <input
              type="text"
              className="w-full rounded border p-2"
              placeholder="Ask something..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress} // ✅ Changed from `onKeyPress` to `onKeyDown`
            />
            <button
              className="mt-2 w-full rounded bg-blue-500 px-4 py-2 text-white"
              onClick={() => void handleSend()}
              disabled={loading}
            >
              {loading ? "Thinking..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
