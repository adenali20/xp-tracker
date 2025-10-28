import { useState } from "react";
import "./Friends.css";

const Friends = () => {
  const [friends] = useState([
    { id: 1, name: "John Doe", lastMessage: "Hey there!" },
    { id: 2, name: "Sarah Lee", lastMessage: "Let’s catch up soon." },
    { id: 3, name: "Alex Kim", lastMessage: "How’s it going?" },
  ]);

  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const handleSelectFriend = (friend) => {
    setSelectedFriend(friend);
    // Fetch chat history here (for now, mock data)
    setMessages([
      { sender: "me", text: "Hi " + friend.name + "!" },
      { sender: friend.name, text: friend.lastMessage },
    ]);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg = { sender: "me", text: newMessage };
    setMessages((prev) => [...prev, msg]);
    setNewMessage("");
  };

  return (
    <div className="friends-container">
      {/* Left Sidebar */}
      <div className="friends-list">
        <h2>Friends</h2>
        <ul>
          {friends.map((friend) => (
            <li
              key={friend.id}
              className={selectedFriend?.id === friend.id ? "active" : ""}
              onClick={() => handleSelectFriend(friend)}
            >
              <span className="friend-name">{friend.name}</span>
              <p className="last-message">{friend.lastMessage}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Right Chat Panel */}
      <div className="chat-panel">
        {selectedFriend ? (
          <>
            <div className="chat-header">
              <h3>{selectedFriend.name}</h3>
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
