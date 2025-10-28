import { useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { Video, Phone, Smile, ArrowLeft } from "lucide-react";
import "./Friends.css";

const Friends = () => {
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [search, setSearch] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const [friends] = useState([
    { id: 1, name: "John Doe", online: true, lastSeen: null },
    { id: 2, name: "Sarah Lee", online: false, lastSeen: "10 min ago" },
    { id: 3, name: "Alex Kim", online: false, lastSeen: "2 hours ago" },
    { id: 4, name: "Nina Patel", online: true, lastSeen: null },
    { id: 5, name: "Mike Johnson", online: false, lastSeen: "5 min ago" },
    { id: 6, name: "Emma Watson", online: true, lastSeen: null },
    { id: 7, name: "Chris Evans", online: false, lastSeen: "1 hour ago" },
    { id: 8, name: "Robert Downey", online: true, lastSeen: null },
    { id: 9, name: "Scarlett Johansson", online: false, lastSeen: "30 min ago" },
    { id: 10, name: "Tom Holland", online: true, lastSeen: null },
    { id: 11, name: "Benedict Cumberbatch", online: false, lastSeen: "2 hours ago" },
    { id: 12, name: "Mark Ruffalo", online: true, lastSeen: null },
    { id: 13, name: "Chris Hemsworth", online: false, lastSeen: "10 min ago" },
    { id: 14, name: "Paul Rudd", online: true, lastSeen: null },
    { id: 15, name: "Elizabeth Olsen", online: false, lastSeen: "5 min ago" },
    { id: 16, name: "Anthony Mackie", online: true, lastSeen: null },
    { id: 17, name: "Sebastian Stan", online: false, lastSeen: "1 hour ago" },
    { id: 18, name: "Brie Larson", online: true, lastSeen: null },
    { id: 19, name: "Don Cheadle", online: false, lastSeen: "2 hours ago" },
    { id: 20, name: "Chris Pratt", online: true, lastSeen: null },
  ]);

  const [messages, setMessages] = useState({});

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !imagePreview) return;
    if (!selectedFriend) return;

    const newMsg = [];

    if (newMessage.trim()) {
      newMsg.push({ sender: "me", text: newMessage, time: new Date() });
    }

    if (imagePreview) {
      newMsg.push({ sender: "me", image: imagePreview, time: new Date() });
      setImagePreview(null);
    }

    // Simulated friend reply
    newMsg.push({ sender: "friend", text: "Got your message! 👍", time: new Date() });

    setMessages((prev) => ({
      ...prev,
      [selectedFriend.id]: [...(prev[selectedFriend.id] || []), ...newMsg],
    }));

    setNewMessage("");
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emojiData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
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
          placeholder="🔍 Search friends..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <div className="friends-scroll">
          <ul>
            {filteredFriends.map((friend) => (
              <li
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
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Chat Panel */}
      {selectedFriend && (
        <div className="chat-panel">
          <div className="chat-header">
            <button className="back-btn mobile-only" onClick={() => setSelectedFriend(null)}>
              <ArrowLeft size={20} />
            </button>
            <div className="chat-header-left">
              <p className="name">{selectedFriend.name}</p>
              <p className="status">{selectedFriend.online ? "Online 🟢" : `Last seen ⏰ ${selectedFriend.lastSeen}`}</p>
            </div>
            <div className="actions">
              <Video className="chat-icon" />
              <Phone className="chat-icon" />
            </div>
          </div>

          <div className="chat-messages">
            {(messages[selectedFriend.id] || []).map((msg, i) => (
              <div key={i} className="message-container">
                <div className={`message ${msg.sender === "me" ? "sent" : "received"}`}>
                  {msg.text}
                  {msg.image && <img src={msg.image} alt="sent" className="message-image" />}
                </div>
                <span className={`message-time ${msg.sender === "me" ? "sent-time" : "received-time"}`}>
                  {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>

          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="preview" />
              <button onClick={() => setImagePreview(null)}>❌</button>
            </div>
          )}

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

            <label htmlFor="image-upload">📎</label>
            <input type="file" id="image-upload" accept="image/*" onChange={handleImageUpload} />

            <button type="submit">Send</button>
          </form>

          {showEmojiPicker && (
            <div className="emoji-popup">
              <div className="emoji-header">
                <span>Pick Emoji 😄</span>
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
