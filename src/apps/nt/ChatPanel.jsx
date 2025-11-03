import React, { useRef, useEffect } from "react";
import { Video, Phone, Smile, ArrowLeft, Image } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

const ChatPanel = ({
  selectedFriend,
  setSelectedFriend,
  messages,
  newMessage,
  setNewMessage,
  handleSendMessage,
  showEmojiPicker,
  setShowEmojiPicker,
  handleEmojiClick,
  handleImageChange,
  imageFile,
  removeImage,
}) => {
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedFriend]);

  return (
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

      <div className="chat-messages">
        {(messages[selectedFriend.id] || []).map((msg, i) => (
          <div key={i} className="message-container">
            <div className={`message ${msg.sender === "me" ? "sent" : "received"}`}>
              {msg.text}
              {msg.image && <img src={msg.image} alt="sent" className="message-image" />}
            </div>
            <span className={`message-time ${msg.sender === "me" ? "sent-time" : "received-time"}`}>
              {msg.time}
            </span>
          </div>
        ))}
        <div ref={chatEndRef}></div>
      </div>

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

      {imageFile && (
        <div className="image-preview">
          <img src={URL.createObjectURL(imageFile)} alt="preview" />
          <button onClick={removeImage}>❌</button>
        </div>
      )}

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
  );
};

export default ChatPanel;
