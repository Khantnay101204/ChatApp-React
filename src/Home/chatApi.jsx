const BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api/v1";

export const getToken = () => {
  // 1. Read 'jwt' from browser cookies
  const cookieMatch = document.cookie
    .split("; ")
    .find((row) => row.startsWith("jwt="));

  if (cookieMatch) {
    return decodeURIComponent(cookieMatch.split("=")[1]);
  }

  // 2. Fallback to localStorage
  const raw = localStorage.getItem("jwt") || localStorage.getItem("token");
  if (!raw || raw === "null" || raw === "undefined") return null;
  return raw.replace(/^"|"$/g, "").trim();
};

// Decode logged-in user ID from JWT payload
export const getCurrentUserId = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id || payload._id || null;
  } catch {
    return null;
  }
};

const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
};

// Users
export const searchUsers = (query) =>
  apiFetch(`/users?search=${encodeURIComponent(query)}`);

// Chats & Groups
export const fetchInboxChats = () => apiFetch("/chats");

export const createGroupChat = (name, userIds) =>
  apiFetch("/chats/group", {
    method: "POST",
    body: JSON.stringify({ name, users: userIds }),
  });

export const renameGroupChat = (chatId, chatName) =>
  apiFetch("/chats/rename", {
    method: "PUT",
    body: JSON.stringify({ chatId, chatName }),
  });

export const addUserToGroup = (chatId, userId) =>
  apiFetch("/chats/groupadd", {
    method: "PUT",
    body: JSON.stringify({ chatId, userId }),
  });

export const removeUserFromGroup = (chatId, userId) =>
  apiFetch("/chats/groupremove", {
    method: "PUT",
    body: JSON.stringify({ chatId, userId }),
  });

// Messages
export const fetchRoomMessages = (chatId) => apiFetch(`/messages/${chatId}`);

export const sendMessageApi = ({ chatId, recipientId, message }) =>
  apiFetch("/messages", {
    method: "POST",
    body: JSON.stringify(
      chatId ? { chatId, message } : { recipientId, message },
    ),
  });

export const editMessageApi = (messageId, message) =>
  apiFetch(`/messages/single/${messageId}`, {
    method: "PATCH",
    body: JSON.stringify({ message }),
  });
