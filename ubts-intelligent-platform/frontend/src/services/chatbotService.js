import api from "../api/axios";

export const askChatbot = async (query) => {
  const response = await api.post("/chatbot/ask/", { query });
  return response.data;
};

export const findNearestCampFromChatbot = async (coordinates) => {
  const response = await api.post("/camps/nearest/", coordinates);
  return response.data;
};