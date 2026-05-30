import { useState } from "react";
import {
  askChatbot,
  findNearestCampFromChatbot,
} from "../services/chatbotService";
import NearestCampMap from "../components/NearestCampMap";

function Chatbot() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [nearestCamp, setNearestCamp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState("");

  const addMessage = (sender, text) => {
    setMessages((prev) => [...prev, { sender, text }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!query.trim()) return;

    const userQuestion = query;
    setQuery("");
    setError("");
    addMessage("user", userQuestion);

    try {
      setLoading(true);

      const data = await askChatbot(userQuestion);

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

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-2xl bg-white shadow">
        <div className="border-b border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-900">UBTS Chatbot</h2>
          <p className="mt-2 text-slate-600">
            Ask about blood donation, eligibility, availability, or nearest
            donation camps.
          </p>
        </div>

        <div className="h-[420px] space-y-4 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="rounded-xl bg-slate-50 p-4 text-slate-600">
              Try asking: “Is blood donation safe?” or “Where can I donate blood
              near me?”
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
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                    message.sender === "user"
                      ? "bg-red-700 text-white"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="text-sm text-slate-500">
              Assistant is thinking...
            </div>
          )}

          {locationLoading && (
            <div className="text-sm text-slate-500">
              Getting your location and finding nearest camp...
            </div>
          )}
        </div>

        {error && (
          <div className="mx-6 mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-3 border-t p-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your question..."
            className="flex-1 rounded-lg border border-slate-300 p-3 outline-none focus:border-red-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-red-700 px-5 py-3 font-medium text-white hover:bg-red-800 disabled:bg-red-400"
          >
            Send
          </button>
        </form>
      </div>

      {nearestCamp && (
        <section className="space-y-4 rounded-2xl bg-white p-6 shadow">
          <div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900">
              Nearest Donation Camp Map
            </h3>

            <p className="text-slate-700">{nearestCamp.assistant_response}</p>
          </div>

          <NearestCampMap camp={nearestCamp.nearest_camp} />
        </section>
      )}
    </div>
  );
}

export default Chatbot;