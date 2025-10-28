import { useState } from "react";
import { Circle, Video, Phone, ArrowLeft } from "lucide-react";
import "./Friends.css";

const Friends = () => {
  const [friends] = useState([
    { id: 1, name: "John Doe", lastMessage: "Hey there!", online: true, lastSeen: null },
    { id: 2, name: "Sarah Lee", lastMessage: "Let’s catch up soon.", online: false, lastSeen: "10 min ago" },
    { id: 3, name: "Alex Kim", lastMessage: "How’s it going?", online: false, lastSeen: "2 hours ago" },
    { id: 4, name: "Nina Patel", lastMessage: "Ping me later.", online: true, lastSeen: null },
  ]);

  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const handleSelectFriend = (friend) => {
    setSelectedFriend(friend);
    setMessages([
      { sender: "me", text: "Hi " + friend.name + "!" },
      { sender: friend.name, text: friend.lastMessage },
    ]);
  };

  const handleBack = () => {
    setSelectedFriend(null);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg = { sender: "me", text: newMessage };
    setMessages((prev) => [...prev, msg]);
    setNewMessage("");
  };

  const handleVideoCall = () => {
    alert(`🎥 Starting video call with ${selectedFriend.name}...`);
  };

  const handleVoiceCall = () => {
    alert(`📞 Starting voice call with ${selectedFriend.name}...`);
  };

  return (
    <div
      className={`friends-container ${
        selectedFriend ? "chat-active" : ""
      }`}
    >
      {/* Friends List */}
      <div className="friends-list">
        <h2>Friends</h2>
        <ul>
          {friends.map((friend) => (
            <li
              key={friend.id}
              className={selectedFriend?.id === friend.id ? "active" : ""}
              onClick={() => handleSelectFriend(friend)}
            >
              <div className="friend-info">
                <div className="status-icon">
                  <Circle
                    size={12}
                    fill={friend.online ? "green" : "gray"}
                    stroke={friend.online ? "green" : "gray"}
                  />
                </div>
                <div className="friend-details">
                  <span className="friend-name">{friend.name}</span>
                  <p className="last-message">{friend.lastMessage}</p>
                </div>
              </div>
              <span className="last-seen">
                {friend.online ? "Online" : `Last seen ${friend.lastSeen}`}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Panel */}
      <div className="chat-panel">
        {selectedFriend ? (
          <>
            <div className="chat-header">
              {/* ✅ Back button for mobile */}
              <button
                className="icon-btn back-btn"
                onClick={handleBack}
                title="Back"
              >
                <ArrowLeft size={20} />
              </button>

              <div className="chat-friend-info">
                <Circle
                  size={10}
                  fill={selectedFriend.online ? "green" : "gray"}
                  stroke={selectedFriend.online ? "green" : "gray"}
                />
                <h3>{selectedFriend.name}</h3>
                <span className="chat-status">
                  {selectedFriend.online
                    ? "Online"
                    : `Last seen ${selectedFriend.lastSeen}`}
                </span>
              </div>

              {/* Call Icons */}
              <div className="chat-actions">
                <button
                  className="icon-btn"
                  title="Voice Call"
                  onClick={handleVoiceCall}
                >
                  <Phone size={20} />
                </button>
                <button
                  className="icon-btn"
                  title="Video Call"
                  onClick={handleVideoCall}
                >
                  <Video size={20} />
                </button>
              </div>
            </div>

            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`chat-message ${
                    msg.sender === "me" ? "sent" : "received"
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
              ))}
            </div>

            <form className="chat-input" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit">Send</button>
            </form>
          </>
        ) : (
          <div className="no-chat">
            <p>Select a friend to start chatting 💬</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends;
