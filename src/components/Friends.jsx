import { useState, useRef, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import {
  Video,
  Phone,
  Smile,
  ArrowLeft,
  CircleDot,
  Circle,
  Image as ImageIcon,
} from "lucide-react";
import "./Friends.css";

const Friends = () => {
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [search, setSearch] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 20 friends
  const [friends] = useState([
    { id: 1, name: "John Doe", online: true, lastSeen: null },
    { id: 2, name: "Sarah Lee", online: false, lastSeen: "10 min ago" },
    { id: 3, name: "Alex Kim", online: true, lastSeen: null },
    { id: 4, name: "Nina Patel", online: false, lastSeen: "2 hours ago" },
    { id: 5, name: "Mike Johnson", online: true, lastSeen: null },
    { id: 6, name: "Emily Zhang", online: true, lastSeen: null },
    { id: 7, name: "David Brown", online: false, lastSeen: "3 hours ago" },
    { id: 8, name: "Sophia Wilson", online: true, lastSeen: null },
    { id: 9, name: "James Taylor", online: false, lastSeen: "1 hour ago" },
    { id: 10, name: "Olivia Davis", online: true, lastSeen: null },
    { id: 11, name: "Daniel Moore", online: false, lastSeen: "30 min ago" },
    { id: 12, name: "Emma White", online: true, lastSeen: null },
    { id: 13, name: "Liam Anderson", online: false, lastSeen: "5 hours ago" },
    { id: 14, name: "Ava Thomas", online: true, lastSeen: null },
    { id: 15, name: "Mason Harris", online: true, lastSeen: null },
    { id: 16, name: "Isabella Clark", online: false, lastSeen: "7 hours ago" },
    { id: 17, name: "Ethan Lewis", online: true, lastSeen: null },
    { id: 18, name: "Mia Walker", online: false, lastSeen: "2 days ago" },
    { id: 19, name: "Lucas Hall", online: true, lastSeen: null },
    { id: 20, name: "Charlotte Young", online: false, lastSeen: "1 day ago" },
  ]);

  // Predefined messages
  const [messages, setMessages] = useState({
    1: [
      { sender: "friend", text: "Hey! How’s it going?", time: "10:30 AM" },
      { sender: "me", text: "All good 😊 what about you?", time: "10:31 AM" },
    ],
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !imagePreview) || !selectedFriend) return;

    const timeNow = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newMsg = {
      sender: "me",
      text: newMessage,
      image: imagePreview,
      time: timeNow,
    };

    setMessages((prev) => ({
      ...prev,
      [selectedFriend.id]: [...(prev[selectedFriend.id] || []), newMsg],
    }));

    // clear
    setNewMessage("");
    setImagePreview(null);
    setShowEmojiPicker(false);

    // simulate friend reply
    setTimeout(() => {
      const replyTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setMessages((prev) => ({
        ...prev,
        [selectedFriend.id]: [
          ...(prev[selectedFriend.id] || []),
          { sender: "friend", text: "Got your message! 👍", time: replyTime },
        ],
      }));
    }, 1000);
  };

  const handleEmojiClick = (emojiData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedFriend]);

  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="friends-container">
      {/* ------------------ Friends List ------------------ */}
      <div className={`friends-list ${selectedFriend ? "hidden-mobile" : ""}`}>
        <h2>Friends</h2>
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search friends..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="friends-scroll">
          {filteredFriends.map((friend) => (
            <div
              key={friend.id}
              className={`friend-item ${
                selectedFriend?.id === friend.id ? "selected" : ""
              }`}
              onClick={() => setSelectedFriend(friend)}
            >
              <div className="friend-avatar">
                {friend.online ? (
                  <span className="status-dot online" />
                ) : (
                  <span className="status-dot offline" />
                )}
              </div>
              <div className="friend-info">
                <p className="name">{friend.name}</p>
                <p className="status">
                  {friend.online
                    ? "Online 🟢"
                    : `Last seen ⏰ ${friend.lastSeen}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ------------------ Chat Panel ------------------ */}
      {selectedFriend && (
        <div className="chat-panel">
          <div className="chat-header">
            <div className="chat-header-left">
              <button
                className="back-btn mobile-only"
                onClick={() => setSelectedFriend(null)}
              >
                <ArrowLeft size={20} />
              </button>
              <h3 className="name">{selectedFriend.name}</h3>
            </div>
            <div className="actions">
              <Video className="chat-icon" />
              <Phone className="chat-icon" />
            </div>
          </div>

          <div className="chat-messages">
            {(messages[selectedFriend.id] || []).map((msg, i) => (
              <div key={i} className="message-container">
                <div
                  className={`message ${
                    msg.sender === "me" ? "sent" : "received"
                  }`}
                >
                  {msg.text && <span>{msg.text}</span>}
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="sent"
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
            <div ref={messagesEndRef} />
          </div>

          {/* Image preview */}
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="preview" />
              <button onClick={() => setImagePreview(null)}>Remove</button>
            </div>
          )}

          {/* Input */}
          <form className="chat-input" onSubmit={handleSendMessage}>
            <label>
              <ImageIcon size={22} />
              <input type="file" accept="image/*" onChange={handleImageUpload} />
            </label>

            <button
              type="button"
              className="emoji-btn"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
            >
              <Smile size={22} />
            </button>

            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />

            <button type="submit">Send</button>
          </form>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="emoji-popup">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
              <div style={{ textAlign: "center", padding: "6px" }}>
                <button onClick={() => setShowEmojiPicker(false)}>❌ Close</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Friends;
