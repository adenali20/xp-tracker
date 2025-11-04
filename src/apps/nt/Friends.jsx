import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import FriendsList from "./FriendsList";
import ChatPanel from "./ChatPanel";
import VideoChatPanel from "./VideoChatPanel";
import { fetchFriends } from "../../redux/reducers/friendsSlice";
import io from "socket.io-client";
import "./Friends.css";

const SOCKET_URL = "wss://dev.adenali.com/socket.io"; // HTTPS via Ingress

const Friends = () => {
  const dispatch = useDispatch();
  const { friends = [], loading, error } = useSelector((state) => state.friends) || {};
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [search, setSearch] = useState("");
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
      auth: { token },
      transports: ["websocket"], // force WebSocket
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
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleEmojiClick = (emojiData) => setNewMessage((prev) => prev + emojiData.emoji);
  const handleImageChange = (e) => e.target.files[0] && setImageFile(e.target.files[0]);
  const removeImage = () => setImageFile(null);

  if (loading) return <p>Loading friends...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="friends-container">
      <FriendsList
        friends={friends}
        filteredFriends={filteredFriends}
        selectedFriend={selectedFriend}
        setSelectedFriend={setSelectedFriend}
        search={search}
        setSearch={setSearch}
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
            handleEmojiClick={handleEmojiClick}
            handleImageChange={handleImageChange}
            imageFile={imageFile}
            removeImage={removeImage}
            socket={socketRef.current}
          />
          <VideoChatPanel socket={socketRef.current} selectedFriend={selectedFriend} />
        </>
      )}
    </div>
  );
};

export default Friends;
