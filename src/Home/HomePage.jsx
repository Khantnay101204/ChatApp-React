import React, { useEffect, useState } from "react";
import { fetchInboxChats, searchUsers, getCurrentUserId } from "./chatApi";
import ChatBox from "./ChatBox";
import GroupModal from "./GroupModal";
import socket from "../SocketConfig";
import "./ChatUI.css";

export default function HomePage() {
  const currentUserId = getCurrentUserId();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [pendingRecipient, setPendingRecipient] = useState(null);
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
    loadInbox();
  }, []);

  // Socket.IO personal room setup + instant inbox & group updates
  useEffect(() => {
    if (!currentUserId) return;

    const joinPersonalRoom = () => {
      socket.emit("setup", currentUserId);
    };

    joinPersonalRoom();
    socket.on("connect", joinPersonalRoom);

    const handleInboxUpdate = () => {
      loadInbox();
    };

    const handleGroupUpdated = (updatedChat) => {
      setChats((prev) =>
        prev.map((c) =>
          String(c._id) === String(updatedChat._id) ? updatedChat : c,
        ),
      );
      setSelectedChat((prev) =>
        String(prev?._id) === String(updatedChat._id) ? updatedChat : prev,
      );
    };

    // Group appears immediately in the added user's inbox (without toast popup)
    const handleAddedToGroup = (newGroup) => {
      if (!newGroup?._id) return;
      setChats((prev) => {
        const exists = prev.some((c) => String(c._id) === String(newGroup._id));
        return exists
          ? prev.map((c) =>
              String(c._id) === String(newGroup._id) ? newGroup : c,
            )
          : [newGroup, ...prev];
      });
    };

    // Group disappears immediately from the removed/left user's inbox & closes if open
    const handleRemovedFromGroup = ({ chatId }) => {
      setChats((prev) => prev.filter((c) => String(c._id) !== String(chatId)));
      setSelectedChat((prev) =>
        String(prev?._id) === String(chatId) ? null : prev,
      );
    };

    socket.on("inbox updated", handleInboxUpdate);
    socket.on("group updated", handleGroupUpdated);
    socket.on("added to group", handleAddedToGroup);
    socket.on("removed from group", handleRemovedFromGroup);

    return () => {
      socket.off("connect", joinPersonalRoom);
      socket.off("inbox updated", handleInboxUpdate);
      socket.off("group updated", handleGroupUpdated);
      socket.off("added to group", handleAddedToGroup);
      socket.off("removed from group", handleRemovedFromGroup);
    };
  }, [currentUserId]);

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

  const getChatTitle = (chat) => {
    if (chat.isGroupChat) return chat.chatName;
    const otherUser = chat.users?.find(
      (u) => String(u._id) !== String(currentUserId),
    );
    return otherUser ? otherUser.name : "Direct Message";
  };

  const handleSelectSearchedUser = (user) => {
    setSearchTerm("");
    setSearchResults([]);

    const existing = chats.find(
      (c) =>
        !c.isGroupChat &&
        c.users.some((u) => String(u._id) === String(user._id)),
    );

    if (existing) {
      setPendingRecipient(null);
      setSelectedChat(existing);
    } else {
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
      {/* Hidden SVG filter for hand-drawn pencil border */}
      <svg
        style={{ position: "absolute", width: 0, height: 0 }}
        aria-hidden="true"
      >
        <filter id="pencil-sketch">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.035"
            numOctaves="3"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="2.5"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
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
              setChats((prev) =>
                prev.map((c) =>
                  String(c._id) === String(updatedChat._id) ? updatedChat : c,
                ),
              );
            }}
            onLeaveGroup={(leftChatId) => {
              setSelectedChat(null);
              setChats((prev) =>
                prev.filter((c) => String(c._id) !== String(leftChatId)),
              );
            }}
          />
        ) : (
          <div className="empty-state">
            Select a conversation or search for a user to start messaging.
          </div>
        )}
      </main>

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
