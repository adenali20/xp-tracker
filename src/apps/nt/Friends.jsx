import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import FriendsList from "./FriendsList";
import ChatPanel from "./ChatPanel";
import { fetchFriends } from "../../redux/reducers/friendsSlice";
import "./Friends.css";

const Friends = () => {
  const dispatch = useDispatch();

  // Safely access friends slice, provide defaults if undefined
  const friendsState = useSelector((state) => state.friends) || {};
  const { friends = [], loading = false, error = null } = friendsState;

  // Local component state
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [search, setSearch] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [messages, setMessages] = useState({});

  // Fetch friends from API on mount
  useEffect(() => {
    dispatch(fetchFriends());
  }, [dispatch]);

  // Filter friends based on search input
  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  // Send a message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!selectedFriend || (!newMessage.trim() && !imageFile)) return;

    const newMsg = {
      sender: "me",
      text: newMessage,
      image: imageFile ? URL.createObjectURL(imageFile) : null,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const replyMsg = {
      sender: "friend",
      text: "Got your message! 👍",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => ({
      ...prev,
      [selectedFriend.id]: [...(prev[selectedFriend.id] || []), newMsg, replyMsg],
    }));

    setNewMessage("");
    setImageFile(null);
    setShowEmojiPicker(false);
  };

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
      />
      {selectedFriend && (
        <ChatPanel
          selectedFriend={selectedFriend}
          setSelectedFriend={setSelectedFriend}
          messages={messages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleSendMessage={handleSendMessage}
          showEmojiPicker={showEmojiPicker}
          setShowEmojiPicker={setShowEmojiPicker}
          handleEmojiClick={handleEmojiClick}
          handleImageChange={handleImageChange}
          imageFile={imageFile}
          removeImage={removeImage}
        />
      )}
    </div>
  );
};

export default Friends;
