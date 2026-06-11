/**
 * Red Dirt Blooms — "Dusty" AI Chatbot (Enhanced)
 * Named after Oklahoma's dusty red roads.
 * Now powered by real LLM via tRPC backend.
 * Features: quick-reply chips, conversation history, typing indicator,
 * minimize button, unread badge, reset chat, and richer header.
 */
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Flower2, Minimize2, RotateCcw } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Message {
  role: "user" | "dusty";
  text: string;
  timestamp: Date;
}

const QUICK_REPLIES = [
  "What's blooming right now?",
  "How do I order flowers?",
  "Do you deliver to Edmond?",
  "Tell me about the Bloom Box",
  "How long do bouquets last?",
  "Are your flowers organic?",
  "Do you sell wholesale?",
  "What's in season?",
];

const WELCOME_MESSAGE: Message = {
  role: "dusty",
  text: "Well hey there, neighbor! 🌻 I'm Dusty — your guide to all things Red Dirt Blooms. Ask me about what's growin', how to order, delivery, or anything else. What can I help y'all with today?",
  timestamp: new Date(),
};

export default function DustyChat() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chatMutation = trpc.dusty.chat.useMutation({
    onSuccess: (data) => {
      const dustyMsg: Message = {
        role: "dusty",
        text: data.reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, dustyMsg]);
      if (!open || minimized) {
        setUnreadCount((c) => c + 1);
      }
    },
    onError: () => {
      const fallback: Message = {
        role: "dusty",
        text: "Well shoot, I hit a snag! Try asking me again or reach out at hello@reddirtblooms.ai 🌸",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallback]);
      toast.error("Dusty had trouble connecting. Try again!");
    },
  });

  useEffect(() => {
    if (open && !minimized && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, minimized]);

  useEffect(() => {
    if (open && !minimized) {
      setUnreadCount(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, minimized]);

  const sendMessage = (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || chatMutation.isPending) return;

    const userMsg: Message = {
      role: "user",
      text: messageText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Build history for context (last 6 messages, excluding welcome)
    const history = messages
      .slice(1)
      .slice(-6)
      .map((m) => ({
        role: m.role === "user" ? ("user" as const) : ("assistant" as const),
        content: m.text,
      }));

    chatMutation.mutate({ message: messageText, history });
  };

  const resetChat = () => {
    setMessages([{ ...WELCOME_MESSAGE, timestamp: new Date() }]);
    setInput("");
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => {
          setOpen(!open);
          setMinimized(false);
        }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#B5451B] text-[#F5F0E8] shadow-xl hover:bg-[#9e3c17] transition-all flex items-center justify-center"
        style={{ boxShadow: "0 4px 20px rgba(181,69,27,0.4)" }}
        aria-label="Chat with Dusty"
      >
        {open ? (
          <X className="w-5 h-5" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
        {!open && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#E8A020] text-[#2A1F1A] text-xs font-bold flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Chat Window */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 bg-[#F5F0E8] rounded-xl shadow-2xl border border-[#B5451B]/20 flex flex-col overflow-hidden"
          style={{
            width: "clamp(320px, 90vw, 400px)",
            maxHeight: minimized ? "64px" : "520px",
            transition: "max-height 0.3s ease",
          }}
        >
          {/* Header */}
          <div className="bg-[#B5451B] px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-[#E8A020] flex items-center justify-center flex-shrink-0">
                <Flower2 className="w-5 h-5 text-[#2A1F1A]" />
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#7A8C6E] border-2 border-[#B5451B]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-heading text-[#F5F0E8] font-semibold text-base leading-none">Dusty</div>
              <div className="font-body text-[#F5F0E8]/70 text-xs mt-0.5">
                {chatMutation.isPending ? "Thinking..." : "Your Red Dirt Blooms Guide · Online"}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={resetChat}
                className="w-7 h-7 rounded flex items-center justify-center text-[#F5F0E8]/60 hover:text-[#F5F0E8] hover:bg-white/10 transition-colors"
                title="Start over"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setMinimized(!minimized)}
                className="w-7 h-7 rounded flex items-center justify-center text-[#F5F0E8]/60 hover:text-[#F5F0E8] hover:bg-white/10 transition-colors"
                title={minimized ? "Expand" : "Minimize"}
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded flex items-center justify-center text-[#F5F0E8]/60 hover:text-[#F5F0E8] hover:bg-white/10 transition-colors"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto p-4 space-y-3"
                style={{ maxHeight: "320px" }}
              >
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}
                  >
                    {msg.role === "dusty" && (
                      <div className="w-7 h-7 rounded-full bg-[#B5451B] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Flower2 className="w-3.5 h-3.5 text-[#F5F0E8]" />
                      </div>
                    )}
                    <div className="flex flex-col gap-0.5 max-w-[80%]">
                      <div
                        className={`px-3 py-2 rounded-xl font-body text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-[#B5451B] text-[#F5F0E8] rounded-br-sm"
                            : "bg-white text-[#2A1F1A] rounded-bl-sm border border-[#B5451B]/10 shadow-sm"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <div
                        className={`font-body text-[10px] text-[#2A1F1A]/30 ${
                          msg.role === "user" ? "text-right" : "text-left"
                        }`}
                      >
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {chatMutation.isPending && (
                  <div className="flex justify-start gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#B5451B] flex items-center justify-center flex-shrink-0">
                      <Flower2 className="w-3.5 h-3.5 text-[#F5F0E8]" />
                    </div>
                    <div className="bg-white border border-[#B5451B]/10 rounded-xl rounded-bl-sm px-4 py-3 shadow-sm">
                      <div className="flex gap-1 items-center h-4">
                        {[0, 150, 300].map((delay) => (
                          <div
                            key={delay}
                            className="w-1.5 h-1.5 rounded-full bg-[#B5451B]/50 animate-bounce"
                            style={{ animationDelay: `${delay}ms` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Quick Reply Chips — show only on first message */}
              {messages.length === 1 && (
                <div className="px-3 pb-2">
                  <p className="font-body text-[10px] text-[#2A1F1A]/40 mb-1.5 uppercase tracking-wide">Quick questions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_REPLIES.slice(0, 6).map((qr) => (
                      <button
                        key={qr}
                        onClick={() => sendMessage(qr)}
                        disabled={chatMutation.isPending}
                        className="font-body text-xs bg-white border border-[#B5451B]/20 text-[#B5451B] hover:bg-[#B5451B] hover:text-[#F5F0E8] px-2.5 py-1 rounded-full transition-colors disabled:opacity-50"
                      >
                        {qr}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="border-t border-[#B5451B]/10 p-3 flex gap-2 bg-white flex-shrink-0">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Ask Dusty anything..."
                  disabled={chatMutation.isPending}
                  className="flex-1 bg-[#F5F0E8] border border-[#B5451B]/20 rounded-lg px-3 py-2 font-body text-sm text-[#2A1F1A] placeholder-[#2A1F1A]/40 focus:outline-none focus:border-[#B5451B] disabled:opacity-60"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || chatMutation.isPending}
                  className="w-9 h-9 rounded-lg bg-[#B5451B] text-[#F5F0E8] flex items-center justify-center hover:bg-[#9e3c17] transition-colors flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Footer */}
              <div className="px-3 py-1.5 bg-white border-t border-[#B5451B]/5 text-center">
                <p className="font-body text-[10px] text-[#2A1F1A]/30">
                  Powered by AI · Red Dirt Blooms · OKC Metro
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
