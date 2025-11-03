import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import FriendsList from "./FriendsList";
import ChatPanel from "./ChatPanel";
import { fetchFriends } from "../../redux/reducers/friendsSlice";
import { setMessages, addMessage } from "../../redux/reducers/messagesSlice";
import io from "socket.io-client";
import "./Friends.css";

const SOCKET_URL = "http://10.0.0.167:3001";

const Friends = () => {
  const dispatch = useDispatch();
  const friendsState = useSelector((state) => state.friends) || {};
  const messages = useSelector((state) => state.messages.list) || [];

  const { friends = [], loading = false, error = null } = friendsState;

  const [selectedFriend, setSelectedFriend] = useState(null);
  const [search, setSearch] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const socketRef = useRef(null);

  // Connect socket
  useEffect(() => {
    const token = sessionStorage.getItem("jwtToken");
    if (!token) return;

    const socket = io(SOCKET_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on("receiveMessage", (data) => {
      dispatch(addMessage(data));
    });

    socket.on("userOnline", (users) => setOnlineUsers(users));
    socket.on("userOffline", (username) =>
      setOnlineUsers((prev) => prev.filter((u) => u !== username))
    );

    return () => socket.disconnect();
  }, [dispatch]);

  // Fetch friends
  useEffect(() => {
    dispatch(fetchFriends());
  }, [dispatch]);

  // Fetch messages on login
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const username = sessionStorage.getItem("userName");
        const res = await fetch(`/api/messages?user=${username}`);
        const data = await res.json(); // should return flat list of messages
        dispatch(setMessages(data));
      } catch (err) {
        console.log("Failed to fetch messages", err);
      }
    };
    fetchMessages();
  }, [dispatch]);

  const filteredFriends = friends.filter((f) =>
    f.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEmojiClick = (emojiData) =>
    setNewMessage((prev) => prev + emojiData.emoji);

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
        onlineUsers={onlineUsers}
      />

      {selectedFriend && (
        <ChatPanel
          selectedFriend={selectedFriend}
          setSelectedFriend={setSelectedFriend}
          messages={messages}
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
