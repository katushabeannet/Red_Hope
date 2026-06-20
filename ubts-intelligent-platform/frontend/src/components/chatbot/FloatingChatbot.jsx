import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  RiCloseLine,
  RiMapPinLine,
  RiMessage3Line,
  RiRobot2Line,
  RiSendPlaneLine,
  RiUser3Line,
} from "react-icons/ri";

import {
  askChatbot,
  findNearestCampFromChatbot,
} from "../../services/chatbotService";
import { useToast } from "../../context/ToastContext";
import { useTheme } from "../../context/ThemeContext";
import redHopeLogo from "../../assets/logo/redhope.png";

const WELCOME =
  "Hello! I'm RedHope AI. Ask me about eligibility, availability, blood donation questions, or nearby donation camps.";

const QUICK_REPLIES = [
  "Is blood donation safe?",
  "Am I eligible to donate blood?",
  "Can I donate again?",
  "Where can I donate blood near me?",
];

function FloatingChatbot() {
  const { showToast } = useToast();
  const { dark } = useTheme();

  const [open, setOpen]               = useState(false);
  const [messages, setMessages]       = useState([{ from: "bot", text: WELCOME }]);
  const [input, setInput]             = useState("");
  const [isTyping, setIsTyping]       = useState(false);
  const [locationLoading, setLocLoad] = useState(false);

  const endRef = useRef(null);

  useEffect(() => {
    if (open && endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, isTyping, locationLoading]);

  const addBotMessage  = (text, meta = null) =>
    setMessages((prev) => [...prev, { from: "bot", text, meta }]);

  const addUserMessage = (text) =>
    setMessages((prev) => [...prev, { from: "user", text }]);

  const formatBackendResponse = (data) => {
    if (data.mode === "ELIGIBILITY" && data.eligibility_result) {
      const r = data.eligibility_result;
      return {
        text: data.assistant_response,
        meta: {
          title:      "Eligibility Result",
          status:     r.is_eligible ? "Eligible" : "Not Eligible",
          statusType: r.is_eligible ? "success" : "error",
          reasons:    r.reasons || [],
        },
      };
    }
    if (data.mode === "AVAILABILITY" && data.availability_result) {
      const r = data.availability_result;
      return {
        text: data.assistant_response,
        meta: {
          title: "Availability Prediction",
          items: [
            ["Status",      r.is_available ? "Available" : "Not Available"],
            ["Probability", r.availability_probability != null
              ? `${Math.round(r.availability_probability * 100)}%`
              : "Not provided"],
          ],
        },
      };
    }
    if (data.mode === "COMBINED") {
      return {
        text: data.assistant_response,
        meta: {
          title: "Donor Readiness Check",
          items: [
            ["Eligibility",    data.eligibility_result?.is_eligible   ? "Eligible"  : "Not Eligible"],
            ["Availability",   data.availability_result?.is_available ? "Available" : "Not Available"],
            ["Campaign Ready", data.is_campaign_ready                 ? "Yes"       : "No"],
          ],
        },
      };
    }
    return {
      text: data.assistant_response || data.message || "I received a response from the backend.",
      meta: null,
    };
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      addBotMessage("Geolocation is not supported by this browser.");
      showToast({ type: "error", title: "Location Unsupported", message: "Your browser does not support geolocation." });
      return;
    }

    setLocLoad(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const data = await findNearestCampFromChatbot({
            latitude:  position.coords.latitude,
            longitude: position.coords.longitude,
          });
          const camp = data.nearest_camp;
          const responseText = camp
            ? `The nearest active donation camp is ${camp.name}, located at ${camp.venue} in ${camp.district}. It is about ${data.distance_km} km away from your current location.`
            : "I could not find an active donation camp near your location.";

          addBotMessage(responseText, {
            title:      "Nearest Donation Camp",
            status:     camp?.status || "Active",
            statusType: "success",
            items: [
              ["Camp",     camp?.name],
              ["Venue",    camp?.venue],
              ["District", camp?.district],
              ["Region",   camp?.region],
              ["Distance", `${data.distance_km} km away`],
              ["Contact",  camp?.contact_phone],
            ],
          });

          showToast({ type: "success", title: "Nearest Camp Found", message: data.nearest_camp?.name || "A nearby camp was found." });
        } catch {
          addBotMessage("Sorry, I could not find the nearest donation camp.");
          showToast({ type: "error", title: "Camp Search Failed", message: "Unable to find the nearest donation camp." });
        } finally { setLocLoad(false); }
      },
      () => {
        addBotMessage("Location access was denied.");
        setLocLoad(false);
        showToast({ type: "error", title: "Location Denied", message: "Please allow location access to find nearby donation camps." });
      }
    );
  };

  const send = async (text = null) => {
    const messageText = (text || input).trim();
    if (!messageText || isTyping) return;

    addUserMessage(messageText);
    setInput("");
    setIsTyping(true);

    try {
      const data = await askChatbot(messageText);
      if (data.action_type === "REQUEST_LOCATION" || data.mode === "GEOSPATIAL") {
        addBotMessage(data.assistant_response);
        requestLocation();
        return;
      }
      const formatted = formatBackendResponse(data);
      addBotMessage(formatted.text, formatted.meta);
    } catch (err) {
      addBotMessage("Sorry, I failed to get a response from the backend.");
      showToast({
        type:    "error",
        title:   "Chatbot Error",
        message: err.response?.data?.error || err.response?.data?.detail || "The chatbot backend could not process your request.",
      });
    } finally { setIsTyping(false); }
  };

  return (
    <>
      {/* ── FAB ── */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => setOpen(true)}
            style={{
              position: "fixed", bottom: 24, right: 24, zIndex: 50,
              width: 58, height: 58, borderRadius: "50%", border: "none",
              background: "linear-gradient(135deg, var(--cr), var(--cr-dk))",
              color: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 32px rgba(185,28,28,.35), 0 2px 8px rgba(0,0,0,.15)",
            }}
          >
            <RiMessage3Line size={26} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat window ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 24 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            style={{
              position: "fixed", bottom: 24, right: 24, zIndex: 50,
              width: 420, height: "75vh", maxHeight: 720, minHeight: 480,
              display: "flex", flexDirection: "column",
              borderRadius: 22, overflow: "hidden",
              border: dark ? "1.5px solid #334155" : "1.5px solid rgba(255,255,255,.2)",
              boxShadow: "0 24px 64px rgba(0,0,0,.18), 0 4px 16px rgba(0,0,0,.1)",
              background: dark ? "#1E293B" : "#fff",
            }}
          >
            {/* Header */}
            <div style={{
              background: "linear-gradient(135deg, var(--cr) 0%, var(--cr-dk) 100%)",
              padding: "14px 16px", flexShrink: 0,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                background: "rgba(255,255,255,.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <RiRobot2Line size={20} style={{ color: "#fff" }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 13, color: "#fff", margin: 0 }}>
                  RedHope AI
                </p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,.75)", margin: "2px 0 0", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", display: "inline-block", flexShrink: 0 }} />
                  Connected to AI backend
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "rgba(255,255,255,.18)", border: "none", cursor: "pointer",
                  borderRadius: 8, padding: 6, color: "#fff", lineHeight: 0, flexShrink: 0,
                  transition: "background .15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.3)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.18)"; }}
              >
                <RiCloseLine size={18} />
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", background: dark ? "#0F172A" : "#F8F9FB", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 12, position: "relative" }}>
              {/* Logo watermark */}
              <img src={redHopeLogo} alt="" aria-hidden="true" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "60%", maxWidth: 180, opacity: 0.06, pointerEvents: "none", userSelect: "none", zIndex: 0 }} />
              {messages.map((msg, i) => (
                <ChatBubble key={i} msg={msg} />
              ))}

              {(isTyping || locationLoading) && (
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                    background: dark ? "rgba(196,30,58,.2)" : "#FDEEF1", color: "var(--cr)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {locationLoading ? <RiMapPinLine size={13} /> : <RiRobot2Line size={13} />}
                  </div>
                  <div style={{
                    background: dark ? "#1E293B" : "#fff", border: dark ? "1.5px solid #334155" : "1.5px solid #E8EAF0",
                    borderRadius: "14px 14px 14px 4px", padding: "9px 14px",
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      {[0, 1, 2].map((i) => (
                        <div key={i} style={{
                          width: 5, height: 5, borderRadius: "50%", background: "#94a3b8",
                          animation: `typing-dot .85s ${i * 0.18}s infinite ease-in-out`,
                        }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>
                      {locationLoading ? "Finding nearest camp…" : "Thinking…"}
                    </span>
                  </div>
                </div>
              )}

              <div ref={endRef} />
            </div>

            {/* Quick replies */}
            {messages.length <= 1 && !isTyping && (
              <div style={{
                display: "flex", flexWrap: "wrap", gap: 6, padding: "10px 12px",
                borderTop: dark ? "1px solid #334155" : "1px solid #E8EAF0", background: dark ? "#1E293B" : "#F8F9FB", flexShrink: 0,
              }}>
                {QUICK_REPLIES.map((reply) => (
                  <button key={reply} onClick={() => send(reply)} style={{
                    background: dark ? "#0F172A" : "#fff", border: dark ? "1.5px solid #334155" : "1.5px solid #E2E8F0",
                    borderRadius: 999, padding: "5px 12px", fontSize: 11,
                    fontWeight: 600, color: "var(--ink-s)", cursor: "pointer",
                    fontFamily: "inherit", transition: "border-color .15s, color .15s",
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--cr)"; e.currentTarget.style.color = "var(--cr)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.color = "var(--ink-s)"; }}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Input row */}
            <div style={{
              display: "flex", gap: 8, padding: "10px 12px",
              borderTop: dark ? "1px solid #334155" : "1px solid #E8EAF0", background: dark ? "#1E293B" : "#fff", flexShrink: 0,
            }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask about donation…"
                style={{
                  flex: 1, borderRadius: 10, border: dark ? "1.5px solid #334155" : "1.5px solid #E2E8F0",
                  background: dark ? "#0F172A" : "#F8F9FB", padding: "9px 13px",
                  fontSize: 12, color: "var(--ink)", outline: "none", fontFamily: "inherit",
                  transition: "border-color .15s",
                }}
                onFocus={(e) => { e.target.style.borderColor = "var(--cr)"; }}
                onBlur={(e)  => { e.target.style.borderColor = dark ? "#334155" : "#E2E8F0"; }}
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || isTyping}
                style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: "var(--cr)", color: "#fff", border: "none",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: !input.trim() || isTyping ? 0.5 : 1,
                  transition: "opacity .15s, background .15s",
                }}
                onMouseEnter={(e) => { if (input.trim() && !isTyping) e.currentTarget.style.background = "var(--cr-dk)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--cr)"; }}
              >
                <RiSendPlaneLine size={17} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Individual chat bubble with optional meta card ── */
function ChatBubble({ msg }) {
  const { dark } = useTheme();
  const isUser = msg.from === "user";
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: isUser ? "flex-end" : "flex-start", alignItems: "flex-end" }}>
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
          background: dark ? "rgba(196,30,58,.2)" : "#FDEEF1", color: "var(--cr)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <RiRobot2Line size={13} />
        </div>
      )}

      <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{
          borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
          padding: "10px 13px", fontSize: 12, lineHeight: 1.65, fontWeight: 500,
          background: isUser
            ? "linear-gradient(135deg, var(--cr), var(--cr-dk))"
            : (dark ? "#1E293B" : "#fff"),
          color:  isUser ? "#fff" : "var(--ink)",
          border: isUser ? "none" : (dark ? "1.5px solid #334155" : "1.5px solid #E8EAF0"),
          boxShadow: "0 1px 4px rgba(0,0,0,.06)",
        }}>
          {msg.text}
        </div>

        {msg.meta && <MetaCard meta={msg.meta} />}
      </div>

      {isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
          background: "var(--cr)", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <RiUser3Line size={13} />
        </div>
      )}
    </div>
  );
}

/* ── Structured data card inside bot messages ── */
function MetaCard({ meta }) {
  const { dark } = useTheme();
  const statusColor =
    meta.statusType === "success" ? { bg: dark ? "rgba(21,128,61,.2)" : "#DCFCE7", text: dark ? "#86efac" : "#15803d" }
    : meta.statusType === "error"   ? { bg: dark ? "rgba(185,28,28,.2)" : "#FEE2E2", text: dark ? "#fca5a5" : "#b91c1c" }
    : { bg: dark ? "rgba(59,130,246,.15)" : "#EFF6FF", text: "var(--blue)" };

  return (
    <div style={{
      background: dark ? "#0F172A" : "#fff", borderRadius: 12,
      border: dark ? "1.5px solid #334155" : "1.5px solid #E8EAF0", overflow: "hidden",
      boxShadow: "0 1px 4px rgba(0,0,0,.05)", fontSize: 11,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderBottom: dark ? "1px solid #1E293B" : "1px solid #F1F5F9" }}>
        <span style={{ fontWeight: 700, color: "var(--ink)", fontSize: 11 }}>{meta.title}</span>
        {meta.status && (
          <span style={{
            background: statusColor.bg, color: statusColor.text,
            borderRadius: 999, padding: "2px 9px", fontSize: 10, fontWeight: 700,
          }}>
            {meta.status}
          </span>
        )}
      </div>

      {/* Reasons */}
      {meta.reasons && meta.reasons.length > 0 && (
        <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: 5 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: "var(--ink-l)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Reasons
          </p>
          {meta.reasons.map((r, i) => (
            <div key={i} style={{
              background: dark ? "#1E293B" : "#F8F9FB", borderRadius: 7, padding: "6px 9px",
              fontSize: 11, color: "var(--ink-s)", lineHeight: 1.5, border: dark ? "1px solid #334155" : "1px solid #E8EAF0",
            }}>
              {r}
            </div>
          ))}
        </div>
      )}

      {/* Key-value items */}
      {meta.items && (
        <div style={{ padding: "8px 12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
          {meta.items.map(([label, value]) => (
            <div key={label} style={{ background: dark ? "#1E293B" : "#F8F9FB", borderRadius: 7, padding: "6px 9px", border: dark ? "1px solid #334155" : "1px solid #E8EAF0" }}>
              <p style={{ fontSize: 10, color: "var(--ink-l)", margin: "0 0 2px", fontWeight: 500 }}>{label}</p>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ink)", margin: 0 }}>{value || "N/A"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FloatingChatbot;
