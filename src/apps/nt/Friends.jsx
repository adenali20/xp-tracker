import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import FriendsList from "./FriendsList";
import ChatPanel from "./ChatPanel";
import VideoChatPanel from "./VideoChatPanel";
import { fetchFriends } from "../../redux/reducers/friendsSlice";
import io from "socket.io-client";
import "./Friends.css";

const Friends = () => {
  const dispatch = useDispatch();
  const { friends = [], loading, error } = useSelector((state) => state.friends) || {};
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showVideoChat, setShowVideoChat] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [incomingCallOffer, setIncomingCallOffer] = useState(null);
  const [incomingCaller, setIncomingCaller] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    const token = sessionStorage.getItem("jwtToken");
    if (!token) return;

    const socket = io("https://dev.adenali.com", {
      path: "/socket.io",
      transports: ["websocket"],
      auth: { token },
    });
    socketRef.current = socket;

    socket.on("receiveMessage", (msg) => setMessages((prev) => [...prev, msg]));
    socket.on("userOnline", (users) => setOnlineUsers(users));
    socket.on("userOffline", (username) =>
      setOnlineUsers((prev) => prev.filter((u) => u !== username))
    );

    socket.on("incomingCall", ({ from, offer }) => {
      console.log("########### incoming received");
      setIncomingCaller(from);
      setIncomingCallOffer(offer);
      setSelectedFriend(friends.find((f) => f.name === from) || { name: from });
    });

    return () => socket.disconnect();
  }, [friends]);

  useEffect(() => {
    dispatch(fetchFriends());
  }, [dispatch]);

  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes("")
  );

  const handleVideoCallClick = () => {
    setShowVideoChat(true);
    setIsMinimized(false);
    setIncomingCallOffer(null);
    setIncomingCaller(null);
  };

  const handleIncomingCallAccept = () => {
    setShowVideoChat(true);
    setIsMinimized(false);
  };

  const handleIncomingCallDecline = () => {
    setIncomingCallOffer(null);
    setIncomingCaller(null);
  };

  if (loading) return <p>Loading friends...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="friends-container">
      {/* Video Chat Overlay */}
      {showVideoChat && (
        <div
          className={`video-chat-overlay ${
            isMinimized ? "video-chat-minimized" : ""
          }`}
          style={{ pointerEvents: isMinimized ? "none" : "auto" }}
        >
          <VideoChatPanel
            socket={socketRef.current}
            selectedFriend={selectedFriend}
            incomingCallOffer={incomingCallOffer}
          />

          {/* Buttons */}
          <div
            className="video-overlay-controls"
            style={{ pointerEvents: "auto" }} // allows buttons to be clickable even when minimized
          >
            <button
              className="minimize-btn"
              onClick={() => setIsMinimized((prev) => !prev)}
            >
              {isMinimized ? "🗖" : "🗕"}
            </button>
            <button
              className="close-video-chat-btn"
              onClick={() => setShowVideoChat(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Existing layout */}
      <FriendsList
        friends={friends}
        filteredFriends={filteredFriends}
        selectedFriend={selectedFriend}
        setSelectedFriend={(friend) => {
          setSelectedFriend(friend);
          setShowVideoChat(false);
          setIncomingCallOffer(null);
          setIncomingCaller(null);
        }}
        onlineUsers={onlineUsers}
      />

      {selectedFriend && (
        <>
          <ChatPanel
            selectedFriend={selectedFriend}
            setSelectedFriend={setSelectedFriend}
            messages={messages.filter(
              (m) =>
                (m.fromUser === selectedFriend.name &&
                  m.to === sessionStorage.getItem("userName")) ||
                (m.fromUser === sessionStorage.getItem("userName") &&
                  m.to === selectedFriend.name)
            )}
            setMessages={setMessages}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            showEmojiPicker={showEmojiPicker}
            setShowEmojiPicker={setShowEmojiPicker}
            handleImageChange={(file) => setImageFile(file)}
            imageFile={imageFile}
            removeImage={() => setImageFile(null)}
            socket={socketRef.current}
            onVideoCallClick={handleVideoCallClick}
          />

          {incomingCallOffer && !showVideoChat && (
            <div className="incoming-call-banner">
              <p>{incomingCaller} is calling...</p>
              <button onClick={handleIncomingCallAccept}>Accept</button>
              <button onClick={handleIncomingCallDecline}>Decline</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Friends;
