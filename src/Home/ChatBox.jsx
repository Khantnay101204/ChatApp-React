import React, { useEffect, useRef, useState } from "react";
import {
  fetchRoomMessages,
  sendMessageApi,
  editMessageApi,
  renameGroupChat,
  addUserToGroup,
  removeUserFromGroup,
  searchUsers,
} from "./chatApi";
import MsgBubble from "./MsgBubble";
import socket from "../SocketConfig";

export default function ChatBox({
  chat,
  pendingRecipient,
  currentUserId,
  chatTitle,
  onFirstMessageCreated,
  onChatUpdated,
  onLeaveGroup,
}) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [memberResults, setMemberResults] = useState([]);
  const bottomRef = useRef(null);

  const isGroupAdmin =
    chat?.isGroupChat &&
    (chat.groupAdmin?._id || chat.groupAdmin) === currentUserId;

  // 1. Join Socket.IO room and load decrypted message history when active chat changes
  useEffect(() => {
    setShowGroupInfo(false);

    if (!chat?._id) {
      setMessages([]);
      return;
    }

    socket.emit("join chat", chat._id);

    setLoading(true);
    fetchRoomMessages(chat._id)
      .then((res) => setMessages(res.data.messages || []))
      .catch((err) => console.error("Failed to fetch messages:", err.message))
      .finally(() => setLoading(false));
  }, [chat?._id]);

  // 2. Listen for incoming real-time messages and inline edits in the active room
  useEffect(() => {
    const handleIncomingMessage = ({ chat: incomingChat, message }) => {
      if (incomingChat?._id === chat?._id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
    };

    const handleEditedMessage = ({ chatId, messageId, updatedText }) => {
      if (chatId === chat?._id) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, decryptedMessage: updatedText, edited: true }
              : m,
          ),
        );
      }
    };

    socket.on("message received", handleIncomingMessage);
    socket.on("message edited", handleEditedMessage);

    return () => {
      socket.off("message received", handleIncomingMessage);
      socket.off("message edited", handleEditedMessage);
    };
  }, [chat?._id]);

  // 3. Auto-scroll to the latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4. Send message via REST (encrypt + save) and broadcast via Socket.IO
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText;
    setInputText("");

    try {
      const payload = chat?._id
        ? { chatId: chat._id, message: text }
        : { recipientId: pendingRecipient._id, message: text };

      const res = await sendMessageApi(payload);
      const sent = res.data.message;

      const formattedMsg = {
        id: sent.id,
        sender: sent.sender,
        chat: sent.chat,
        decryptedMessage: sent.message,
        edited: false,
        sentAt: sent.sentAt,
      };

      if (!chat?._id && sent.chat) {
        // First 1-on-1 DM: join the newly created room and notify the recipient live
        const createdRoom = await onFirstMessageCreated(sent.chat);
        if (createdRoom) {
          socket.emit("join chat", createdRoom._id);
          socket.emit("new message", {
            chat: createdRoom,
            message: formattedMsg,
          });
        }
      } else {
        setMessages((prev) => {
          if (prev.some((m) => m.id === formattedMsg.id)) return prev;
          return [...prev, formattedMsg];
        });
        socket.emit("new message", {
          chat,
          message: formattedMsg,
        });
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // 5. Edit own message via REST and broadcast update live
  const handleEditMessage = async (messageId, updatedText) => {
    try {
      const res = await editMessageApi(messageId, updatedText);
      const edited = res.data.message;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, decryptedMessage: edited.message, edited: true }
            : m,
        ),
      );

      if (chat?._id) {
        socket.emit("edit message", {
          chatId: chat._id,
          messageId,
          updatedText: edited.message,
        });
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // 6. Group Admin: Rename group
  const handleRenameGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      const res = await renameGroupChat(chat._id, newGroupName);
      onChatUpdated(res.data.chat);
      setNewGroupName("");
    } catch (err) {
      alert(err.message);
    }
  };

  // 7. Group Admin: Search & add member
  const handleSearchMember = async (q) => {
    setMemberSearch(q);
    if (!q.trim()) return setMemberResults([]);
    try {
      const res = await searchUsers(q);
      setMemberResults(res.data.users || []);
    } catch (err) {
      console.error("Member search failed:", err.message);
    }
  };

  const handleAddMember = async (userId) => {
    try {
      const res = await addUserToGroup(chat._id, userId);
      onChatUpdated(res.data.chat);
      setMemberSearch("");
      setMemberResults([]);
    } catch (err) {
      alert(err.message);
    }
  };

  // 8. Group Admin / Self: Remove member or leave group
  const handleRemoveMember = async (userId) => {
    try {
      const res = await removeUserFromGroup(chat._id, userId);
      if (userId === currentUserId) {
        onLeaveGroup();
      } else {
        onChatUpdated(res.data.chat);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Resolve sender display name in group chats
  const getSenderName = (sender) => {
    const senderId = typeof sender === "object" ? sender._id : sender;
    if (senderId === currentUserId) return "You";
    const found = chat?.users?.find((u) => u._id === senderId);
    return found ? found.name : "User";
  };

  return (
    <div className="chatbox-wrapper">
      {/* Top Header */}
      <header className="chatbox-header">
        <div>
          <h3>{chatTitle}</h3>
          <span className="chat-sub">
            {chat?.isGroupChat
              ? `${chat.users.length} members`
              : "End-to-End Encrypted"}
          </span>
        </div>

        {chat?.isGroupChat && (
          <button
            className="btn-secondary"
            onClick={() => setShowGroupInfo(!showGroupInfo)}
          >
            {showGroupInfo ? "Close Settings" : "Group Info"}
          </button>
        )}
      </header>

      {/* Group Settings Drawer */}
      {showGroupInfo && chat?.isGroupChat && (
        <div className="group-drawer">
          <div className="drawer-row">
            <input
              type="text"
              placeholder="New group name..."
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />
            <button className="btn-primary" onClick={handleRenameGroup}>
              Rename
            </button>
          </div>

          {isGroupAdmin && (
            <div className="drawer-section">
              <input
                type="text"
                placeholder="Add member by name..."
                value={memberSearch}
                onChange={(e) => handleSearchMember(e.target.value)}
              />
              {memberResults.map((u) => (
                <div key={u._id} className="member-chip">
                  <span>{u.name}</span>
                  <button type="button" onClick={() => handleAddMember(u._id)}>
                    + Add
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="drawer-members">
            {chat.users.map((u) => (
              <span key={u._id} className="member-tag">
                {u.name}
                {(isGroupAdmin || u._id === currentUserId) && (
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => handleRemoveMember(u._id)}
                    title={
                      u._id === currentUserId ? "Leave group" : "Remove member"
                    }
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Message Feed */}
      <div className="messages-feed">
        {loading ? (
          <p className="empty-state">Decrypting messages...</p>
        ) : messages.length === 0 ? (
          <p className="empty-state">
            Send a message to start this encrypted conversation.
          </p>
        ) : (
          messages.map((msg) => {
            const senderId =
              typeof msg.sender === "object" ? msg.sender._id : msg.sender;
            const isOwn = senderId === currentUserId;
            return (
              <MsgBubble
                key={msg.id}
                message={msg}
                isOwn={isOwn}
                senderName={
                  chat?.isGroupChat ? getSenderName(msg.sender) : null
                }
                onEdit={handleEditMessage}
              />
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <form className="message-input-bar" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Write an encrypted message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button type="submit" className="btn-primary">
          Send
        </button>
      </form>
    </div>
  );
}
