import React, { useRef, useEffect } from "react";
import { Video, Phone, Smile, ArrowLeft, Image, X } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { useDispatch } from "react-redux";
import { addMessage } from "../../redux/reducers/messagesSlice";

const ChatPanel = ({
  selectedFriend,
  setSelectedFriend,
  messages,
  newMessage,
  setNewMessage,
  showEmojiPicker,
  setShowEmojiPicker,
  handleEmojiClick,
  handleImageChange,
  imageFile,
  removeImage,
  socket,
  onVideoCallClick, // callback for starting video call
  onVideoCallCancel, // callback for canceling video call
}) => {
  const chatEndRef = useRef(null);
  const dispatch = useDispatch();
  const currentUser = sessionStorage.getItem("userName");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedFriend]);

  const chatMessages = messages.filter(
    (msg) =>
      (msg.fromUser === currentUser && msg.to === selectedFriend.name) ||
      (msg.fromUser === selectedFriend.name && msg.to === currentUser)
  );

  const sendMessage = (e) => {
    e?.preventDefault();
    if (!newMessage.trim() && !imageFile) return;
    if (!socket) return;

    const msg = {
      fromUser: currentUser,
      to: selectedFriend.name,
      text: newMessage,
      image: imageFile ? URL.createObjectURL(imageFile) : null,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    socket.emit("sendMessage", msg);
    dispatch(addMessage(msg));

    setNewMessage("");
    if (imageFile) removeImage();
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <div className="chat-header-left">
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              className="back-btn mobile-only"
              onClick={() => setSelectedFriend(null)}
            >
              <ArrowLeft size={20} />
            </button>
            <p className="name">{selectedFriend.name}</p>
          </div>
          <p className="status">
            {selectedFriend.online
              ? "Online 🟢"
              : `Last seen ⏰ ${selectedFriend.lastSeen}`}
          </p>
        </div>

        <div className="actions">
          <button
            type="button"
            className="chat-icon-btn"
            onClick={onVideoCallClick}
          >
            <Video className="chat-icon" />
          </button>
          {onVideoCallCancel && (
            <button
              type="button"
              className="chat-icon-btn"
              onClick={onVideoCallCancel}
            >
              <X className="chat-icon" />
            </button>
          )}
          <Phone className="chat-icon" />
        </div>
      </div>

      <div className="chat-messages">
        {chatMessages.map((msg, i) => (
          <div key={i} className="message-container">
            <div
              className={`message ${
                msg.fromUser === currentUser ? "sent" : "received"
              }`}
            >
              {msg.text}
              {msg.image && (
                <img src={msg.image} alt="sent" className="message-image" />
              )}
            </div>
            <span
              className={`message-time ${
                msg.fromUser === currentUser ? "sent-time" : "received-time"
              }`}
            >
              {msg.time}
            </span>
          </div>
        ))}
        <div ref={chatEndRef}></div>
      </div>

      <form className="chat-input" onSubmit={sendMessage}>
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
        <label htmlFor="image-upload" style={{ cursor: "pointer" }}>
          <Image size={22} />
        </label>
        <input
          type="file"
          id="image-upload"
          accept="image/*"
          onChange={handleImageChange}
        />
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
            <button
              className="emoji-cancel-btn"
              onClick={() => setShowEmojiPicker(false)}
            >
              ❌
            </button>
          </div>
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
    </div>
  );
};

export default ChatPanel;
