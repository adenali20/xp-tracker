import { useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { Video, Phone, Smile, ArrowLeft, CircleDot, Circle } from "lucide-react";
import "./Friends.css";

const Friends = () => {
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [search, setSearch] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [friends] = useState([
    { id: 1, name: "John Doe", online: true, lastSeen: null },
    { id: 2, name: "Sarah Lee", online: false, lastSeen: "10 min ago" },
    { id: 3, name: "Alex Kim", online: false, lastSeen: "2 hours ago" },
    { id: 4, name: "Nina Patel", online: true, lastSeen: null },
    { id: 5, name: "Mike Johnson", online: false, lastSeen: "5 min ago" },
    // Add up to 20 friends as before
  ]);

  // Predefined messages for each friend
  const [messages, setMessages] = useState({
    1: [
      { sender: "friend", text: "Hey! How’s it going?" },
      { sender: "me", text: "Hi John! All good 😊" },
      { sender: "friend", text: "Want to catch up later?" },
    ],
    2: [
      { sender: "friend", text: "Hello! Are you free today?" },
      { sender: "me", text: "Hey Sarah, yes I am!" },
    ],
    3: [
      { sender: "friend", text: "Check this out 😎" },
    ],
    // Initialize messages for other friends similarly
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedFriend) return;

    setMessages((prev) => ({
      ...prev,
      [selectedFriend.id]: [
        ...(prev[selectedFriend.id] || []),
        { sender: "me", text: newMessage },
        // Simulate friend reply
        { sender: "friend", text: "Got your message! 👍" },
      ],
    }));

    setNewMessage("");
  };

  const handleEmojiClick = (emojiData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
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
                {friend.online ? <CircleDot className="online-icon" size={12} /> : <Circle className="offline-icon" size={12} />}
              </div>
              <div className="friend-info">
                <p className="name">{friend.name}</p>
                <p className="status">{friend.online ? "Online 🟢" : `Last seen ⏰ ${friend.lastSeen}`}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Panel */}
      {selectedFriend && (
        <div className="chat-panel">
          <div className="chat-header">
            <button className="back-btn mobile-only" onClick={() => setSelectedFriend(null)}>
              <ArrowLeft size={20} />
            </button>
            <h3>{selectedFriend.name}</h3>
            <span className="chat-status">{selectedFriend.online ? "Online 🟢" : `Last seen ⏰ ${selectedFriend.lastSeen}`}</span>
            <div className="chat-actions">
              <Video className="chat-icon" />
              <Phone className="chat-icon" />
            </div>
          </div>

          {/* Chat Messages */}
          <div className="chat-messages">
            {(messages[selectedFriend.id] || []).map((msg, i) => (
              <div key={i} className={`message ${msg.sender === "me" ? "sent" : "received"}`}>
                {msg.text}
              </div>
            ))}
          </div>

          {/* Chat Input with Emoji */}
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
            <button type="submit">Send</button>
          </form>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="emoji-picker">
              <div className="emoji-picker-header">
                <span>Select Emoji 😄</span>
                <button type="button" className="emoji-cancel-btn" onClick={() => setShowEmojiPicker(false)}>❌</button>
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
