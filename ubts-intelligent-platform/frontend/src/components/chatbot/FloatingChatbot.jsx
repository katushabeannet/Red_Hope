import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  RiCloseLine,
  RiMessage3Line,
  RiRobot2Line,
  RiSendPlaneLine,
  RiUser3Line,
} from "react-icons/ri";

import {
  askChatbot,
  findNearestCampFromChatbot,
} from "../../services/chatbotService";

const WELCOME =
  "Hello! I'm the UBTS Assistant. Ask me anything about blood donation — eligibility, safety, locations, or preparation.";

const QUICK_REPLIES = [
  "Is blood donation safe?",
  "Who can donate blood?",
  "Where can I donate?",
];

function FloatingChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ from: "bot", text: WELCOME }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (open && endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const addBotMessage = (text) => {
    setMessages((prev) => [...prev, { from: "bot", text }]);
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      addBotMessage("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const data = await findNearestCampFromChatbot({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });

          addBotMessage(data.assistant_response);
        } catch {
          addBotMessage("Sorry, I could not find the nearest donation camp.");
        }
      },
      () => {
        addBotMessage("Location access was denied.");
      }
    );
  };

  const send = async (text = null) => {
    const messageText = (text || input).trim();
    if (!messageText) return;

    setMessages((prev) => [...prev, { from: "user", text: messageText }]);
    setInput("");
    setIsTyping(true);

    try {
      const data = await askChatbot(messageText);

      addBotMessage(data.assistant_response || data.message);

      if (data.action_type === "REQUEST_LOCATION") {
        requestLocation();
      }
    } catch {
      addBotMessage("Sorry, I failed to get a response.");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-red-700 text-white shadow-2xl transition-colors hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700"
          >
            <RiMessage3Line size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-6 right-6 z-50 flex max-h-[520px] w-[380px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="flex items-center justify-between bg-gradient-to-r from-red-700 to-red-600 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                  <RiRobot2Line size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    UBTS Assistant
                  </p>
                  <p className="flex items-center gap-1 text-xs text-white/80">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Online
                  </p>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-white transition-colors hover:bg-white/20"
              >
                <RiCloseLine size={20} />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4 dark:bg-slate-900">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-2 ${
                    message.from === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      message.from === "bot"
                        ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                        : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {message.from === "bot" ? (
                      <RiRobot2Line size={14} />
                    ) : (
                      <RiUser3Line size={14} />
                    )}
                  </div>

                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm font-medium leading-relaxed ${
                      message.from === "user"
                        ? "rounded-br-none bg-red-700 text-white"
                        : "rounded-bl-none border border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400">
                    <RiRobot2Line size={14} />
                  </div>
                  <div className="flex gap-1.5 rounded-2xl rounded-bl-none border border-slate-200 bg-white px-4 py-2.5 dark:border-slate-700 dark:bg-slate-800">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:0.3s]" />
                  </div>
                </div>
              )}

              <div ref={endRef} />
            </div>

            {messages.length <= 1 && !isTyping && (
              <div className="flex flex-wrap gap-1.5 border-t border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-900">
                {QUICK_REPLIES.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => send(reply)}
                    className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-red-700 hover:text-red-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2 border-t border-slate-200 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-800">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask about blood donation..."
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-red-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50"
              />

              <button
                onClick={() => send()}
                disabled={!input.trim() || isTyping}
                className="rounded-lg bg-red-700 p-2 text-white transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RiSendPlaneLine size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default FloatingChatbot;