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
    { id: 6, name: "Emma Watson", online: true, lastSeen: null },
    { id: 7, name: "David Brown", online: false, lastSeen: "1 hour ago" },
    { id: 8, name: "Sophia Lee", online: true, lastSeen: null },
    { id: 9, name: "James Smith", online: false, lastSeen: "30 min ago" },
    { id: 10, name: "Olivia Davis", online: true, lastSeen: null },
    { id: 11, name: "Liam Wilson", online: false, lastSeen: "3 hours ago" },
    { id: 12, name: "Ava Martinez", online: true, lastSeen: null },
    { id: 13, name: "Ethan Anderson", online: false, lastSeen: "45 min ago" },
    { id: 14, name: "Mia Thomas", online: true, lastSeen: null },
    { id: 15, name: "Noah Jackson", online: false, lastSeen: "20 min ago" },
    { id: 16, name: "Isabella White", online: true, lastSeen: null },
    { id: 17, name: "Lucas Harris", online: false, lastSeen: "1 day ago" },
    { id: 18, name: "Charlotte Lewis", online: true, lastSeen: null },
    { id: 19, name: "Mason Clark", online: false, lastSeen: "2 hours ago" },
    { id: 20, name: "Amelia Robinson", online: true, lastSeen: null },
  ]);

  const [messages, setMessages] = useState({
    1: [
      { sender: "friend", text: "Hey! How’s it going?", timestamp: "10:00 AM" },
      { sender: "me", text: "Hi John! All good 😊", timestamp: "10:01 AM" },
      { sender: "friend", text: "Want to catch up later?", timestamp: "10:02 AM" },
    ],
    2: [
      { sender: "friend", text: "Hello! Are you free today?", timestamp: "09:30 AM" },
      { sender: "me", text: "Hey Sarah, yes I am!", timestamp: "09:32 AM" },
    ],
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedFriend) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => ({
      ...prev,
      [selectedFriend.id]: [
        ...(prev[selectedFriend.id] || []),
        { sender: "me", text: newMessage, timestamp: timeNow },
        { sender: "friend", text: "Got your message! 👍", timestamp: timeNow },
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
              <div key={i} className="message-container">
                <div className={`message ${msg.sender === "me" ? "sent" : "received"}`}>
                  {msg.text}
                </div>
                <span className={`message-time ${msg.sender === "me" ? "sent-time" : "received-time"}`}>
                  {msg.timestamp}
                </span>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <form className="chat-input" onSubmit={handleSendMessage}>
            <button type="button" className="emoji-btn" onClick={() => setShowEmojiPicker(prev => !prev)}>
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
