import { useEffect, useRef, useState } from "react";
import {
  RiCpuLine,
  RiMapPinLine,
  RiRobot2Line,
  RiSendPlaneLine,
  RiUser3Line,
} from "react-icons/ri";

import {
  askChatbot,
  findNearestCampFromChatbot,
} from "../../services/chatbotService";
import NearestCampMap from "../../components/NearestCampMap";
import redHopeLogo from "../../assets/logo/redhope.png";

const STORAGE_KEY       = "ubts_chat_history";
const MAX_HISTORY_TURNS = 5;

const QUICK_PROMPTS = [
  "Is blood donation safe?",
  "Who can donate blood?",
  "How often can I donate?",
  "Find a donation camp near me",
];

function Chatbot() {
  const [query, setQuery]                = useState("");
  const [messages, setMessages]          = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]"); }
    catch { return []; }
  });
  const [nearestCamp, setNearestCamp]    = useState(null);
  const [loading, setLoading]            = useState(false);
  const [locationLoading, setLocLoading] = useState(false);
  const [error, setError]                = useState("");
  const chatEndRef                       = useRef(null);

  const buildHistory = (msgs) =>
    msgs.slice(-MAX_HISTORY_TURNS * 2).map((m) => ({
      role:    m.sender === "user" ? "user" : "assistant",
      content: m.text,
    }));

  const addMessage = (sender, text) => {
    setMessages((prev) => {
      const next = [...prev, { sender, text }];
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    const userQuestion    = query;
    setQuery(""); setError("");
    const historySnapshot = buildHistory(messages);
    addMessage("user", userQuestion);
    try {
      setLoading(true);
      const data = await askChatbot(userQuestion, historySnapshot);
      addMessage("assistant", data.assistant_response || data.message);
      if (data.action_type === "REQUEST_LOCATION") handleLocationRequest();
    } catch { setError("Failed to get a response. Please try again."); }
    finally { setLoading(false); }
  };

  const handleLocationRequest = () => {
    if (!navigator.geolocation) { setError("Geolocation is not supported by this browser."); return; }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const data = await findNearestCampFromChatbot({
            latitude:  position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setNearestCamp(data);
          addMessage("assistant", data.assistant_response);
        } catch { setError("Failed to find nearest donation camp."); }
        finally { setLocLoading(false); }
      },
      () => { setError("Location access was denied."); setLocLoading(false); }
    );
  };

  const clearChat = () => {
    setMessages([]);
    sessionStorage.removeItem(STORAGE_KEY);
    setNearestCamp(null);
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px", display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ── Page header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--cr)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            Conversational Assistant
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 800, color: "var(--ink)", margin: "0 0 10px", lineHeight: 1.2 }}>
            RedHope AI
          </h1>
          <p style={{ fontSize: 14, color: "var(--ink-s)", lineHeight: 1.6, margin: 0, maxWidth: 500 }}>
            Ask general blood donation questions or request nearby donation camp
            recommendations using location intelligence.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#F0FDF4", color: "var(--green)", borderRadius: 999,
            padding: "5px 13px", fontSize: 11, fontWeight: 700, border: "1.5px solid #BBF7D0",
          }}>
            <RiCpuLine size={13} /> MPNet + Action Router
          </span>
          {messages.length > 0 && (
            <button onClick={clearChat} style={{
              background: "none", border: "1.5px solid var(--border)",
              borderRadius: 999, padding: "5px 14px", fontSize: 12,
              color: "var(--ink-l)", cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--cr)"; e.currentTarget.style.color = "var(--cr)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--ink-l)"; }}
            >
              Clear chat
            </button>
          )}
        </div>
      </div>

      {/* ── Error strip ── */}
      {error && (
        <div style={{
          background: "#FFF5F5", border: "1.5px solid #FECACA",
          borderLeft: "4px solid var(--cr)", borderRadius: 12,
          padding: "12px 16px", fontSize: 13, color: "var(--cr)",
        }}>
          {error}
        </div>
      )}

      {/* ── Chat panel ── */}
      <div style={{ borderRadius: 22, border: "1.5px solid var(--border)", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,.07)" }}>

        {/* Panel header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "16px 24px", borderBottom: "1px solid var(--border)", background: "#fff",
        }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: "#FDEEF1", color: "var(--cr)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <RiRobot2Line size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontWeight: 700, color: "var(--ink)", fontSize: 15, margin: 0 }}>
              RedHope AI
            </h2>
            <p style={{ fontSize: 12, color: "var(--ink-l)", margin: "3px 0 0" }}>
              Retrieval answers, role-aware routing, and nearest-camp actions
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-l)" }}>Online</span>
          </div>
        </div>

        {/* Message area */}
        <div
          style={{
            height: "calc(75vh - 220px)", minHeight: 420, overflowY: "auto",
            background: "var(--canvas)", position: "relative",
            padding: "24px", display: "flex", flexDirection: "column", gap: 16,
          }}
        >
          {/* Logo watermark */}
          <img
            src={redHopeLogo}
            alt=""
            aria-hidden="true"
            style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "50%", maxWidth: 280, opacity: 0.06, pointerEvents: "none", userSelect: "none", zIndex: 0 }}
          />

          {messages.length === 0 ? (
            <EmptyState onPickPrompt={setQuery} />
          ) : (
            messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)
          )}

          {loading       && <TypingDots text="Assistant is thinking…" />}
          {locationLoading && <TypingDots icon={<RiMapPinLine size={14} />} text="Getting your location and finding nearest camp…" />}

          <div ref={chatEndRef} />
        </div>

        {/* Input row */}
        <form onSubmit={handleSubmit} style={{
          display: "flex", gap: 10, padding: "14px 20px",
          borderTop: "1px solid var(--border)", background: "#fff",
        }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your question…"
            style={{
              flex: 1, borderRadius: 12, border: "1.5px solid var(--border)",
              background: "var(--canvas)", padding: "11px 16px",
              fontSize: 13, color: "var(--ink)", outline: "none", fontFamily: "inherit",
              transition: "border-color .15s",
            }}
            onFocus={(e) => { e.target.style.borderColor = "var(--cr)"; }}
            onBlur={(e)  => { e.target.style.borderColor = "var(--border)"; }}
          />
          <button type="submit" disabled={loading || !query.trim()} style={{
            display: "flex", alignItems: "center", gap: 7, borderRadius: 12,
            background: "var(--cr)", color: "#fff", border: "none", cursor: "pointer",
            padding: "11px 22px", fontSize: 13, fontWeight: 700, fontFamily: "inherit",
            opacity: loading || !query.trim() ? 0.5 : 1,
            transition: "opacity .15s, background .15s",
          }}
            onMouseEnter={(e) => { if (!loading && query.trim()) e.currentTarget.style.background = "var(--cr-dk)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--cr)"; }}
          >
            <RiSendPlaneLine size={16} /> Send
          </button>
        </form>
      </div>

      {/* ── Nearest camp result ── */}
      {nearestCamp && (
        <div style={{ borderRadius: 22, border: "1.5px solid var(--border)", overflow: "hidden", background: "#fff", boxShadow: "0 4px 24px rgba(0,0,0,.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, padding: "20px 24px", borderBottom: "1px solid var(--border)", flexWrap: "wrap" }}>
            <div>
              <h3 style={{ fontWeight: 700, color: "var(--ink)", fontSize: 16, margin: "0 0 6px" }}>
                Nearest Donation Camp
              </h3>
              <p style={{ fontSize: 13, color: "var(--ink-s)", lineHeight: 1.6, margin: 0 }}>
                {nearestCamp.assistant_response}
              </p>
            </div>
            <span className="badge badge-green">{nearestCamp.distance_km} km away</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: 12, padding: "20px 24px" }}>
            {[
              { label: "Camp",     value: nearestCamp.nearest_camp?.name },
              { label: "Venue",    value: nearestCamp.nearest_camp?.venue },
              { label: "District", value: nearestCamp.nearest_camp?.district },
              { label: "Contact",  value: nearestCamp.nearest_camp?.contact_phone || "Not provided" },
            ].map(({ label, value }) => (
              <div key={label} style={{ borderRadius: 12, border: "1px solid var(--border)", padding: "12px 14px" }}>
                <div style={{ fontSize: 11, color: "var(--ink-l)", marginBottom: 5 }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{value || "N/A"}</div>
              </div>
            ))}
          </div>

          <div style={{ padding: "0 24px 24px" }}>
            <NearestCampMap camp={nearestCamp.nearest_camp} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Empty state with quick prompts ── */
function EmptyState({ onPickPrompt }) {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 20, background: "#FDEEF1", color: "var(--cr)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 18px", boxShadow: "0 4px 20px rgba(185,28,28,.12)",
        }}>
          <RiRobot2Line size={32} />
        </div>
        <h3 style={{ fontWeight: 700, color: "var(--ink)", fontSize: 17, margin: "0 0 10px" }}>
          Start a conversation
        </h3>
        <p style={{ fontSize: 13, color: "var(--ink-s)", lineHeight: 1.65, margin: "0 0 22px" }}>
          Ask about donation safety, eligibility, frequency, or request nearby donation camps using your location.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
          {QUICK_PROMPTS.map((p) => (
            <button key={p} onClick={() => onPickPrompt(p)} style={{
              background: "#fff", border: "1.5px solid var(--border)", borderRadius: 999,
              padding: "7px 16px", fontSize: 12, color: "var(--ink-s)", cursor: "pointer",
              fontFamily: "inherit", fontWeight: 600, transition: "border-color .15s, color .15s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--cr)"; e.currentTarget.style.color = "var(--cr)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--ink-s)"; }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Individual message bubble ── */
function MessageBubble({ msg }) {
  const isUser = msg.sender === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", gap: 10, alignItems: "flex-end" }}>
      {!isUser && (
        <div style={{
          width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
          background: "#FDEEF1", color: "var(--cr)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <RiRobot2Line size={17} />
        </div>
      )}
      <div style={{
        maxWidth: "78%",
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        padding: "12px 16px", fontSize: 13, lineHeight: 1.7,
        background: isUser
          ? "linear-gradient(135deg, var(--cr) 0%, var(--cr-dk) 100%)"
          : "#fff",
        color:  isUser ? "#fff" : "var(--ink)",
        border: isUser ? "none" : "1.5px solid var(--border)",
        boxShadow: "0 2px 8px rgba(0,0,0,.06)",
      }}>
        {msg.text}
      </div>
      {isUser && (
        <div style={{
          width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
          background: "var(--cr)", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <RiUser3Line size={17} />
        </div>
      )}
    </div>
  );
}

/* ── Animated typing indicator ── */
function TypingDots({ icon, text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
        background: "#FDEEF1", color: "var(--cr)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {icon || <RiRobot2Line size={17} />}
      </div>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: "#fff", border: "1.5px solid var(--border)",
        borderRadius: "18px 18px 18px 4px", padding: "10px 16px",
      }}>
        <div style={{ display: "flex", gap: 4 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: "50%", background: "var(--ink-l)",
              animation: `typing-dot .85s ${i * 0.18}s infinite ease-in-out`,
            }} />
          ))}
        </div>
        <span style={{ fontSize: 12, color: "var(--ink-l)" }}>{text}</span>
      </div>
    </div>
  );
}

export default Chatbot;
