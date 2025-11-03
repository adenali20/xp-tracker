import React from "react";

const FriendsList = ({ friends, filteredFriends, selectedFriend, setSelectedFriend, search, setSearch }) => {
  return (
    <div className={`friends-list ${selectedFriend ? "hidden-mobile" : ""}`}>
      <h2>Friends</h2>
      <input
        type="text"
        placeholder="🔍 Search friends..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />
      <div className="friends-scroll">
        {filteredFriends.map((friend) => (
          <div
            key={friend.id}
            className={`friend-item ${selectedFriend?.id === friend.id ? "selected" : ""}`}
            onClick={() => setSelectedFriend(friend)}
          >
            <div className="friend-avatar">
              <span className={`status-dot ${friend.online ? "online" : "offline"}`}></span>
            </div>
            <div className="friend-info">
              <p className="name">{friend.name}</p>
              <p className="status">
                {friend.online ? "Online 🟢" : `Last seen ⏰ ${friend.lastSeen}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendsList;
