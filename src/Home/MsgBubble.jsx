import React, { useState } from "react";

export default function MsgBubble({ message, isOwn, senderName, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(message.decryptedMessage);

  const handleSave = (e) => {
    e.preventDefault();
    if (!draft.trim() || draft === message.decryptedMessage) {
      setIsEditing(false);
      return;
    }
    onEdit(message.id, draft);
    setIsEditing(false);
  };

  return (
    <div className={`msg-row ${isOwn ? "own" : "other"}`}>
      <div className="msg-bubble">
        {senderName && !isOwn && <div className="msg-sender">{senderName}</div>}

        {isEditing ? (
          <form onSubmit={handleSave} className="edit-form">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoFocus
            />
            <button type="submit">Save</button>
            <button type="button" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </form>
        ) : (
          <div className="msg-text">{message.decryptedMessage}</div>
        )}

        <div className="msg-footer">
          {message.edited && <span className="edited-tag">(edited)</span>}
          <span>
            {new Date(message.sentAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {isOwn && !isEditing && (
            <button
              className="edit-link"
              onClick={() => {
                setDraft(message.decryptedMessage);
                setIsEditing(true);
              }}
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
