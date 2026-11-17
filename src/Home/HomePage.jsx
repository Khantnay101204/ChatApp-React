import React, { useEffect, useState } from "react";
import { fetchInboxChats, searchUsers, getCurrentUserId } from "./chatApi";
import ChatBox from "./ChatBox";
import GroupModal from "./GroupModal";
import "./ChatUI.css";
import socket from "../SocketConfig";

export default function HomePage() {
  const currentUserId = getCurrentUserId();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [pendingRecipient, setPendingRecipient] = useState(null); // For first-time 1-on-1 DMs
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showGroupModal, setShowGroupModal] = useState(false);

  const loadInbox = async () => {
    try {
      const res = await fetchInboxChats();
      setChats(res.data.chats || []);
    } catch (err) {
      console.error("Failed to load inbox:", err.message);
    }
  };
  useEffect(() => {
    if (!currentUserId) return;

    socket.emit("setup", currentUserId);

    const handleInboxUpdate = () => {
      loadInbox();
    };

    socket.on("inbox updated", handleInboxUpdate);
    return () => {
      socket.off("inbox updated", handleInboxUpdate);
    };
  }, [currentUserId]);

  useEffect(() => {
    loadInbox();
  }, []);

  // Search users by name/email
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await searchUsers(searchTerm);
        setSearchResults(res.data.users || []);
      } catch (err) {
        console.error("User search failed:", err.message);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Helper to resolve display name for 1-on-1 vs Group chat
  const getChatTitle = (chat) => {
    if (chat.isGroupChat) return chat.chatName;
    const otherUser = chat.users?.find((u) => u._id !== currentUserId);
    return otherUser ? otherUser.name : "Direct Message";
  };

  // Start or open a 1-on-1 chat from search results
  const handleSelectSearchedUser = (user) => {
    setSearchTerm("");
    setSearchResults([]);

    // Check if a 1-on-1 chat with this user already exists in inbox
    const existing = chats.find(
      (c) => !c.isGroupChat && c.users.some((u) => u._id === user._id),
    );

    if (existing) {
      setPendingRecipient(null);
      setSelectedChat(existing);
    } else {
      // Telegram-style: No DB chat created until the first message is sent
      setSelectedChat(null);
      setPendingRecipient(user);
    }
  };

  const handleFirstMessageCreated = async (newChatId) => {
    setPendingRecipient(null);
    const res = await fetchInboxChats();
    const updatedChats = res.data.chats || [];
    setChats(updatedChats);
    const createdRoom = updatedChats.find((c) => c._id === newChatId);
    if (createdRoom) setSelectedChat(createdRoom);
    return createdRoom;
  };

  return (
    <div className="chat-app-container">
      {/* Left Sidebar */}
      <aside className="chat-sidebar">
        <div className="sidebar-header">
          <h2>Messages</h2>
          <button
            className="btn-primary"
            onClick={() => setShowGroupModal(true)}
          >
            + New Group
          </button>
        </div>

        <div className="sidebar-search">
          <input
            type="text"
            placeholder="Search users by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Search Dropdown */}
        {searchResults.length > 0 && (
          <div className="search-results-box">
            <div className="section-label">Start New Chat</div>
            {searchResults.map((user) => (
              <div
                key={user._id}
                className="chat-list-item"
                onClick={() => handleSelectSearchedUser(user)}
              >
                <div className="avatar">{user.name[0]?.toUpperCase()}</div>
                <div className="chat-meta">
                  <div className="chat-title">{user.name}</div>
                  <div className="chat-sub">{user.email}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Active Inbox List */}
        <div className="chat-list">
          {chats.map((chat) => {
            const isActive = selectedChat?._id === chat._id;
            return (
              <div
                key={chat._id}
                className={`chat-list-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  setPendingRecipient(null);
                  setSelectedChat(chat);
                }}
              >
                <div className="avatar">
                  {getChatTitle(chat)[0]?.toUpperCase()}
                </div>
                <div className="chat-meta">
                  <div className="chat-title">
                    {getChatTitle(chat)}
                    {chat.isGroupChat && <span className="badge">Group</span>}
                  </div>
                  <div className="chat-sub">
                    {chat.latestMessage
                      ? `Last message at ${new Date(
                          chat.latestMessage.sentAt || chat.updatedAt,
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}`
                      : "No messages yet"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Right Chat Window */}
      <main className="chat-main">
        {selectedChat || pendingRecipient ? (
          <ChatBox
            chat={selectedChat}
            pendingRecipient={pendingRecipient}
            currentUserId={currentUserId}
            chatTitle={
              selectedChat ? getChatTitle(selectedChat) : pendingRecipient?.name
            }
            onFirstMessageCreated={handleFirstMessageCreated}
            onChatUpdated={(updatedChat) => {
              setSelectedChat(updatedChat);
              loadInbox();
            }}
            onLeaveGroup={() => {
              setSelectedChat(null);
              loadInbox();
            }}
          />
        ) : (
          <div className="empty-state">
            Select a conversation or search for a user to start messaging.
          </div>
        )}
      </main>

      {/* Group Creation Modal */}
      {showGroupModal && (
        <GroupModal
          onClose={() => setShowGroupModal(false)}
          onGroupCreated={(newGroup) => {
            setChats((prev) => [newGroup, ...prev]);
            setSelectedChat(newGroup);
            setPendingRecipient(null);
            setShowGroupModal(false);
          }}
        />
      )}
    </div>
  );
}
