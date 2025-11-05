import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import FriendsList from "./FriendsList";
import ChatPanel from "./ChatPanel";
import VideoChatPanel from "./VideoChatPanel";
import { fetchFriends } from "../../redux/reducers/friendsSlice";
import io from "socket.io-client";
import "./Friends.css";

const SOCKET_URL = "http://20.87.34.159:30001";

const Friends = () => {
  const dispatch = useDispatch();
  const { friends = [], loading, error } = useSelector((state) => state.friends) || {};
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showVideoChat, setShowVideoChat] = useState(false); // controls video panel
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    const token = sessionStorage.getItem("jwtToken");
    if (!token) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("receiveMessage", (msg) => setMessages((prev) => [...prev, msg]));
    socket.on("userOnline", (users) => setOnlineUsers(users));
    socket.on("userOffline", (username) =>
      setOnlineUsers((prev) => prev.filter((u) => u !== username))
    );

    return () => socket.disconnect();
  }, []);

  useEffect(() => { dispatch(fetchFriends()); }, [dispatch]);

  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes("")
  );

  // Trigger video chat panel
  const handleVideoCallClick = () => {
    setShowVideoChat(true);
  };

  if (loading) return <p>Loading friends...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="friends-container">
      <FriendsList
        friends={friends}
        filteredFriends={filteredFriends}
        selectedFriend={selectedFriend}
        setSelectedFriend={(friend) => {
          setSelectedFriend(friend);
          setShowVideoChat(false); // reset video chat if changing friend
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
                (m.fromUser === selectedFriend.name && m.to === sessionStorage.getItem("userName")) ||
                (m.fromUser === sessionStorage.getItem("userName") && m.to === selectedFriend.name)
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
            onVideoCallClick={handleVideoCallClick} // pass the handler
          />

          {/* Only mount VideoChatPanel when user clicks video icon */}
          {showVideoChat && (
            <VideoChatPanel
              socket={socketRef.current}
              selectedFriend={selectedFriend}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Friends;
