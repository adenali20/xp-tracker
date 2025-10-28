import React, { useState, useRef } from "react";
import EmojiPicker from "emoji-picker-react";
import {
  Video,
  Phone,
  Smile,
  ArrowLeft,
  CircleDot,
  Circle,
  X,
  Image as ImageIcon,
} from "lucide-react";
import "./Friends.css";

const Friends = () => {
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [search, setSearch] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [image, setImage] = useState(null);
  const fileInputRef = useRef();

  const [friends] = useState([
    { id: 1, name: "John Doe", online: true, lastSeen: null },
    { id: 2, name: "Sarah Lee", online: false, lastSeen: "10 min ago" },
    { id: 3, name: "Alex Kim", online: false, lastSeen: "2 hours ago" },
    { id: 4, name: "Nina Patel", online: true, lastSeen: null },
    { id: 5, name: "Mike Johnson", online: false, lastSeen: "5 min ago" },
    { id: 6, name: "Emma Wilson", online: true, lastSeen: null },
    { id: 7, name: "Daniel Brown", online: false, lastSeen: "1 hour ago" },
    { id: 8, name: "Sophia Miller", online: false, lastSeen: "20 min ago" },
    { id: 9, name: "James Anderson", online: true, lastSeen: null },
    { id: 10, name: "Olivia Davis", online: false, lastSeen: "3 hours ago" },
    { id: 11, name: "Liam Martinez", online: false, lastSeen: "30 min ago" },
    { id: 12, name: "Isabella Garcia", online: true, lastSeen: null },
    { id: 13, name: "Noah Rodriguez", online: false, lastSeen: "4 hours ago" },
    { id: 14, name: "Mia Hernandez", online: true, lastSeen: null },
    { id: 15, name: "Ethan Lopez", online: false, lastSeen: "8 min ago" },
    { id: 16, name: "Ava Gonzalez", online: false, lastSeen: "2 hours ago" },
    { id: 17, name: "Lucas Perez", online: true, lastSeen: null },
    { id: 18, name: "Charlotte Adams", online: false, lastSeen: "6 hours ago" },
    { id: 19, name: "Elijah Turner", online: true, lastSeen: null },
    { id: 20, name: "Amelia Scott", online: false, lastSeen: "1 day ago" },
  ]);

  const [messages, setMessages] = useState({});

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !image) return;

    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const msg = {
      sender: "me",
      text: newMessage,
      time,
      image: image ? URL.createObjectURL(image) : null,
    };

    setMessages((prev) => ({
      ...prev,
      [selectedFriend.id]: [...(prev[selectedFriend.id] || []), msg],
    }));

    setNewMessage("");
    setImage(null);
  };

  const handleEmojiClick = (emojiData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(file);
  };

  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="friends-container">
      {/* Friends List */}
      <div className={`friends-list ${selectedFriend ? "hidden-mobile" : ""}`}>
        <h2>Friends</h2>
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search friends..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <ul>
          {filteredFriends.map((friend) => (
            <li
              key={friend.id}
              onClick={() => setSelectedFriend(friend)}
              className={selectedFriend?.id === friend.id ? "active" : ""}
            >
              <div className="friend-avatar">
                {friend.online ? (
                  <CircleDot className="online-icon" size={12} />
                ) : (
                  <Circle className="offline-icon" size={12} />
                )}
              </div>
              <div className="friend-info">
                <p className="name">{friend.name}</p>
                <p className="status">
                  {friend.online ? "Online 🟢" : `Last seen ⏰ ${friend.lastSeen}`}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Panel */}
      {selectedFriend && (
        <div className="chat-panel">
          <div className="chat-header">
            <button
              className="back-btn mobile-only"
              onClick={() => setSelectedFriend(null)}
            >
              <ArrowLeft size={20} />
            </button>
            <h3>{selectedFriend.name}</h3>
            <span className="chat-status">
              {selectedFriend.online
                ? "Online 🟢"
                : `Last seen ⏰ ${selectedFriend.lastSeen}`}
            </span>
            <div className="chat-actions">
              <Video className="chat-icon" />
              <Phone className="chat-icon" />
            </div>
          </div>

          <div className="chat-messages">
            {(messages[selectedFriend.id] || []).map((msg, i) => (
              <div
                key={i}
                className={`message-container ${
                  msg.sender === "me" ? "sent-container" : "received-container"
                }`}
              >
                <div
                  className={`message ${
                    msg.sender === "me" ? "sent" : "received"
                  }`}
                >
                  {msg.text && <span>{msg.text}</span>}
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="message"
                      className="message-image"
                    />
                  )}
                </div>
                <span
                  className={`message-time ${
                    msg.sender === "me" ? "sent-time" : "received-time"
                  }`}
                >
                  {msg.time}
                </span>
              </div>
            ))}
          </div>

          <form className="chat-input" onSubmit={handleSendMessage}>
            <button
              type="button"
              className="emoji-btn"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile size={22} />
            </button>
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
            <button
              type="button"
              className="emoji-btn"
              onClick={() => fileInputRef.current.click()}
            >
              <ImageIcon size={22} />
            </button>
            <button type="submit">Send</button>
          </form>

          {showEmojiPicker && (
            <div className="emoji-picker">
              <div className="emoji-picker-header">
                <span>Select Emoji 😄</span>
                <button
                  type="button"
                  className="emoji-cancel-btn"
                  onClick={() => setShowEmojiPicker(false)}
                >
                  ❌
                </button>
              </div>
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}

          {image && (
            <div className="image-preview">
              <img src={URL.createObjectURL(image)} alt="preview" />
              <button onClick={() => setImage(null)}>✖</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Friends;
