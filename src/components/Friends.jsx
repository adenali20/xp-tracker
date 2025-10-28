import { useState, useRef, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import { Video, Phone, Smile, ArrowLeft, Image } from "lucide-react";
import "./Friends.css";

const Friends = () => {
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [search, setSearch] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const chatEndRef = useRef(null);

  const [friends] = useState([
    { id: 1, name: "John Doe", online: true, lastSeen: null },
    { id: 2, name: "Sarah Lee", online: false, lastSeen: "10 min ago" },
    { id: 3, name: "Alex Kim", online: false, lastSeen: "2 hours ago" },
    { id: 4, name: "Nina Patel", online: true, lastSeen: null },
    { id: 5, name: "Mike Johnson", online: false, lastSeen: "5 min ago" },
    { id: 6, name: "Emily Clark", online: true, lastSeen: null },
    { id: 7, name: "David Smith", online: false, lastSeen: "1 hour ago" },
    { id: 8, name: "Sophia Brown", online: true, lastSeen: null },
    { id: 9, name: "James Wilson", online: false, lastSeen: "20 min ago" },
    { id: 10, name: "Olivia Taylor", online: true, lastSeen: null },
    { id: 11, name: "Liam Anderson", online: false, lastSeen: "3 hours ago" },
    { id: 12, name: "Ava Martinez", online: true, lastSeen: null },
    { id: 13, name: "Noah Thomas", online: false, lastSeen: "15 min ago" },
    { id: 14, name: "Mia Robinson", online: true, lastSeen: null },
    { id: 15, name: "Ethan Harris", online: false, lastSeen: "2 hours ago" },
    { id: 16, name: "Isabella Lewis", online: true, lastSeen: null },
    { id: 17, name: "Mason Young", online: false, lastSeen: "5 min ago" },
    { id: 18, name: "Charlotte King", online: true, lastSeen: null },
    { id: 19, name: "Logan Scott", online: false, lastSeen: "1 hour ago" },
    { id: 20, name: "Amelia Green", online: true, lastSeen: null },
  ]);

  const [messages, setMessages] = useState({});

  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!selectedFriend || (!newMessage.trim() && !imageFile)) return;

    const newMsg = {
      sender: "me",
      text: newMessage,
      image: imageFile ? URL.createObjectURL(imageFile) : null,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const replyMsg = {
      sender: "friend",
      text: "Got your message! 👍",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => ({
      ...prev,
      [selectedFriend.id]: [...(prev[selectedFriend.id] || []), newMsg, replyMsg],
    }));

    setNewMessage("");
    setImageFile(null);
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emojiData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedFriend]);

  const handleImageChange = (e) => {
    if (e.target.files[0]) setImageFile(e.target.files[0]);
  };

  const removeImage = () => setImageFile(null);

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
        <div className="friends-scroll">
          {filteredFriends.map((friend) => (
            <div
              key={friend.id}
              className={`friend-item ${selectedFriend?.id === friend.id ? "selected" : ""}`}
              onClick={() => setSelectedFriend(friend)}
            >
              <div className="friend-avatar">
                <span
                  className={`status-dot ${friend.online ? "online" : "offline"}`}
                ></span>
              </div>
              <div className="friend-info">
                <p className="name">{friend.name}</p>
                <p className="status">
                  {friend.online ? "Online 🟢" : `Last seen ⏰ ${friend.lastSeen}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Panel */}
      {selectedFriend && (
        <div className="chat-panel">
          <div className="chat-header">
            <div className="chat-header-left">
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <button className="back-btn mobile-only" onClick={() => setSelectedFriend(null)}>
                  <ArrowLeft size={20} />
                </button>
                <p className="name">{selectedFriend.name}</p>
              </div>
              <p className="status">
                {selectedFriend.online ? "Online 🟢" : `Last seen ⏰ ${selectedFriend.lastSeen}`}
              </p>
            </div>
            <div className="actions">
              <Video className="chat-icon" />
              <Phone className="chat-icon" />
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {(messages[selectedFriend.id] || []).map((msg, i) => (
              <div key={i} className="message-container">
                <div className={`message ${msg.sender === "me" ? "sent" : "received"}`}>
                  {msg.text}
                  {msg.image && (
                    <img src={msg.image} alt="sent" className="message-image" />
                  )}
                </div>
                <span className={`message-time ${msg.sender === "me" ? "sent-time" : "received-time"}`}>
                  {msg.time}
                </span>
              </div>
            ))}
            <div ref={chatEndRef}></div>
          </div>

          {/* Chat Input */}
          <form className="chat-input" onSubmit={handleSendMessage}>
            <button type="button" className="emoji-btn" onClick={() => setShowEmojiPicker((prev) => !prev)}>
              <Smile size={22} />
            </button>
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <label htmlFor="image-upload" style={{ cursor: "pointer" }}>
              <Image size={22} />
            </label>
            <input type="file" id="image-upload" accept="image/*" onChange={handleImageChange} />
            <button type="submit">Send</button>
          </form>

          {/* Show selected image preview */}
          {imageFile && (
            <div className="image-preview">
              <img src={URL.createObjectURL(imageFile)} alt="preview" />
              <button onClick={removeImage}>❌</button>
            </div>
          )}

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="emoji-popup">
              <div className="emoji-header">
                <span>Choose Emoji 😄</span>
                <button className="emoji-cancel-btn" onClick={() => setShowEmojiPicker(false)}>❌</button>
              </div>
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Friends;
