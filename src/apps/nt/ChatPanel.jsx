import React, { useRef, useEffect } from "react";
import { Video, Phone, Smile, ArrowLeft, Image } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

const ChatPanel = ({
  selectedFriend,
  setSelectedFriend,
  messages,
  setMessages,
  newMessage,
  setNewMessage,
  showEmojiPicker,
  setShowEmojiPicker,
  handleEmojiClick,
  handleImageChange,
  imageFile,
  removeImage,
  socket,
}) => {
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedFriend]);

  // Receive private messages
  useEffect(() => {
    if (!socket) return;

    const receiveHandler = (data) => {
      // only handle messages from or to the selected friend
      if (data.fromUser === selectedFriend.username || data.toUser === selectedFriend.username) {
        setMessages((prev) => ({
          ...prev,
          [selectedFriend.username]: [...(prev[selectedFriend.username] || []), data],
        }));
      }
    };

    socket.on("receiveMessage", receiveHandler);
    return () => socket.off("receiveMessage", receiveHandler);
  }, [socket, selectedFriend, setMessages]);

  const sendMessage = (e) => {
    e?.preventDefault();
    if (!newMessage.trim() && !imageFile) return;
    if (!socket) return;

    const msg = {
      fromUser: sessionStorage.getItem("userName"), // sender
      to: selectedFriend.name,             // receiver
      text: newMessage,
      image: imageFile ? URL.createObjectURL(imageFile) : null,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    socket.emit("sendMessage", msg);

    // Add to local state
    setMessages((prev) => ({
      ...prev,
      [selectedFriend.username]: [...(prev[selectedFriend.username] || []), msg],
    }));

    setNewMessage("");
    if (imageFile) removeImage();
  };

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
        {(messages[selectedFriend.username] || []).map((msg, i) => (
          <div key={i} className="message-container">
            <div className={`message ${msg.fromUser === sessionStorage.getItem("userName") ? "sent" : "received"}`}>
              {msg.text}
              {msg.image && <img src={msg.image} alt="sent" className="message-image" />}
            </div>
            <span className={`message-time ${msg.fromUser === sessionStorage.getItem("userName") ? "sent-time" : "received-time"}`}>
              {msg.time}
            </span>
          </div>
        ))}
        <div ref={chatEndRef}></div>
      </div>

      <form className="chat-input" onSubmit={sendMessage}>
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
