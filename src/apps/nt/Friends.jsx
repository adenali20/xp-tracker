import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import FriendsList from "./FriendsList";
import ChatPanel from "./ChatPanel";
import { fetchFriends } from "../../redux/reducers/friendsSlice";
import io from "socket.io-client";
import "./Friends.css";

const SOCKET_URL = "http://10.0.0.167:3001"; // your server URL

const Friends = () => {
  const dispatch = useDispatch();
  const friendsState = useSelector((state) => state.friends) || {};
  const { friends = [], loading = false, error = null } = friendsState;

  const [selectedFriend, setSelectedFriend] = useState(null);
  const [search, setSearch] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [messages, setMessages] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]); // ✅ Track online users

  const socketRef = useRef(null);

  useEffect(() => {
    const token = sessionStorage.getItem("jwtToken");
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
    });
    socketRef.current = socket;

    // Receive message
    socket.on("receiveMessage", (data) => {
      const friendId = data.fromUser === "me" ? data.to : data.fromUser;
      setMessages((prev) => ({
        ...prev,
        [friendId]: [...(prev[friendId] || []), data],
      }));
    });

    // Update online users
    socket.on("userOnline", (users) => setOnlineUsers(users));
    socket.on("userOffline", (username) =>
      setOnlineUsers((prev) => prev.filter((u) => u !== username))
    );

    return () => socket.disconnect();
  }, []);

  // Fetch friends
  useEffect(() => {
    dispatch(fetchFriends());
  }, [dispatch]);

  // Filter friends
  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  // Emoji
  const handleEmojiClick = (emojiData) =>
    setNewMessage((prev) => prev + emojiData.emoji);

  // Image
  const handleImageChange = (e) =>
    e.target.files[0] && setImageFile(e.target.files[0]);
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
        onlineUsers={onlineUsers} // pass online users
      />

      {selectedFriend && (
        <ChatPanel
          selectedFriend={selectedFriend}
          setSelectedFriend={setSelectedFriend}
          messages={messages}
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
      )}
    </div>
  );
};

export default Friends;
