import { useEffect, useRef, useState } from "react";
import {
  RiMapPinLine,
  RiRobot2Line,
  RiSendPlaneLine,
  RiUser3Line,
} from "react-icons/ri";

import {
  askChatbot,
  findNearestCampFromChatbot,
} from "../services/chatbotService";

import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import NearestCampMap from "../components/NearestCampMap";

const STORAGE_KEY = "ubts_chat_history";
const MAX_HISTORY_TURNS = 5;

function Chatbot() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });
  const [nearestCamp, setNearestCamp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState("");
  const chatEndRef = useRef(null);

  // Build GPT-format history from the messages array (last N turns)
  const buildHistory = (msgs) =>
    msgs
      .slice(-MAX_HISTORY_TURNS * 2)
      .map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      }));

  const addMessage = (sender, text) => {
    setMessages((prev) => {
      const next = [...prev, { sender, text }];
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!query.trim()) return;

    const userQuestion = query;
    setQuery("");
    setError("");

    // Capture history BEFORE adding the new user message
    const historySnapshot = buildHistory(messages);
    addMessage("user", userQuestion);

    try {
      setLoading(true);

      const data = await askChatbot(userQuestion, historySnapshot);

      addMessage("assistant", data.assistant_response || data.message);

      if (data.action_type === "REQUEST_LOCATION") {
        handleLocationRequest();
      }
    } catch {
      setError("Failed to get chatbot response.");
    } finally {
      setLoading(false);
    }
  };

  const handleLocationRequest = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const data = await findNearestCampFromChatbot({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });

          setNearestCamp(data);
          addMessage("assistant", data.assistant_response);
        } catch {
          setError("Failed to find nearest donation camp.");
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setError("Location access was denied.");
        setLocationLoading(false);
      }
    );
  };

  const quickPrompts = [
    "Is blood donation safe?",
    "Who can donate blood?",
    "How often can I donate blood?",
    "Where can I donate blood near me?",
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-medium text-[var(--crimson)]">
            Conversational Assistant
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
            UBTS Intelligent Chatbot
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
            Ask general blood donation questions or request nearby donation camp
            recommendations using location intelligence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge label="MPNet + Action Router" variant="donor" />
          {messages.length > 0 && (
            <button
              onClick={() => {
                setMessages([]);
                sessionStorage.removeItem(STORAGE_KEY);
              }}
              className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-muted)] hover:border-red-300 hover:text-red-600"
            >
              Clear chat
            </button>
          )}
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 text-red-700 dark:bg-red-900/20">
          {error}
        </Card>
      )}

      <Card noPad className="overflow-hidden">
        <div className="border-b border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--crimson-light)] text-[var(--crimson)]">
              <RiRobot2Line size={22} />
            </div>

            <div>
              <h2 className="font-semibold text-[var(--text-primary)]">
                Blood Donation Assistant
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Retrieval answers, role-aware routing, and nearest-camp actions
              </p>
            </div>
          </div>
        </div>

        <div className="h-[460px] space-y-5 overflow-y-auto bg-[var(--surface-2)] p-5">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="max-w-md text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--crimson-light)] text-[var(--crimson)]">
                  <RiRobot2Line size={28} />
                </div>

                <h3 className="font-semibold text-[var(--text-primary)]">
                  Start a conversation
                </h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Try asking about donation safety, eligibility, donation
                  frequency, or nearby donation camps.
                </p>

                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setQuery(prompt)}
                      className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:border-[var(--crimson)] hover:text-[var(--crimson)]"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex max-w-[85%] gap-3 ${
                    message.sender === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      message.sender === "user"
                        ? "bg-[var(--crimson)] text-white"
                        : "bg-[var(--surface)] text-[var(--crimson)]"
                    }`}
                  >
                    {message.sender === "user" ? (
                      <RiUser3Line size={16} />
                    ) : (
                      <RiRobot2Line size={16} />
                    )}
                  </div>

                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                      message.sender === "user"
                        ? "bg-[var(--crimson)] text-white"
                        : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)]"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--crimson)] border-t-transparent" />
              Assistant is thinking...
            </div>
          )}

          {locationLoading && (
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <RiMapPinLine />
              Getting your location and finding nearest camp...
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 border-t border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your question..."
            className="min-h-[46px] flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--crimson)]"
          />

          <Button type="submit" loading={loading}>
            <RiSendPlaneLine />
            Send
          </Button>
        </form>
      </Card>

      {nearestCamp && (
        <Card className="space-y-5">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">
                Nearest Donation Camp
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                {nearestCamp.assistant_response}
              </p>
            </div>

            <Badge label={`${nearestCamp.distance_km} km away`} variant="active" />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <CampDetail label="Camp" value={nearestCamp.nearest_camp?.name} />
            <CampDetail label="Venue" value={nearestCamp.nearest_camp?.venue} />
            <CampDetail
              label="District"
              value={nearestCamp.nearest_camp?.district}
            />
            <CampDetail
              label="Contact"
              value={nearestCamp.nearest_camp?.contact_phone || "Not provided"}
            />
          </div>

          <NearestCampMap camp={nearestCamp.nearest_camp} />
        </Card>
      )}
    </div>
  );
}

function CampDetail({ label, value }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 font-semibold text-[var(--text-primary)]">
        {value || "Not available"}
      </p>
    </div>
  );
}

export default Chatbot;