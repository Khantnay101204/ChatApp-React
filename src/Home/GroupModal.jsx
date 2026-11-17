import React, { useState } from "react";
import { searchUsers, createGroupChat } from "./chatApi";

export default function GroupModal({ onClose, onGroupCreated }) {
  const [groupName, setGroupName] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [error, setError] = useState("");

  const handleSearch = async (val) => {
    setQuery(val);
    if (!val.trim()) return setResults([]);
    try {
      const res = await searchUsers(val);
      setResults(res.data.users || []);
    } catch (err) {
      console.error(err.message);
    }
  };

  const addUser = (user) => {
    if (!selectedUsers.some((u) => u._id === user._id)) {
      setSelectedUsers((prev) => [...prev, user]);
    }
    setQuery("");
    setResults([]);
  };

  const removeUser = (id) => {
    setSelectedUsers((prev) => prev.filter((u) => u._id !== id));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return setError("Group name is required.");
    if (selectedUsers.length < 2) {
      return setError("Select at least 2 other members.");
    }

    try {
      const userIds = selectedUsers.map((u) => u._id);
      const res = await createGroupChat(groupName, userIds);
      onGroupCreated(res.data.chat);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3>Create Group Chat</h3>
        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleCreate}>
          <input
            type="text"
            placeholder="Group Name (e.g., Project Alpha)"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Search users to add..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
          />

          {/* Selected User Pills */}
          <div className="selected-pills">
            {selectedUsers.map((u) => (
              <span key={u._id} className="member-tag">
                {u.name}
                <button type="button" onClick={() => removeUser(u._id)}>
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* Search Suggestions */}
          {results.length > 0 && (
            <div className="dropdown-list">
              {results.map((u) => (
                <div
                  key={u._id}
                  className="dropdown-item"
                  onClick={() => addUser(u)}
                >
                  {u.name} ({u.email})
                </div>
              ))}
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
