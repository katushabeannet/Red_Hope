import api from "../api/axios";

export const getMyNotifications = async () => {
  const response = await api.get("/notifications/my/");
  return response.data;
};

export const generateMyNotifications = async () => {
  const response = await api.post("/notifications/generate-my/");
  return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await api.post(`/notifications/${notificationId}/read/`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await api.post("/notifications/read-all/");
  return response.data;
};