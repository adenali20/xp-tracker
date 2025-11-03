import React from "react";

const FriendsList = ({
  filteredFriends,
  selectedFriend,
  setSelectedFriend,
  search,
  setSearch,
  onlineUsers,
}) => {
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
        {filteredFriends.length > 0 ? (
          filteredFriends.map((friend) => {
            const isOnline = onlineUsers.includes(friend.username);
            return (
              <div
                key={friend.id}
                className={`friend-item ${
                  selectedFriend?.id === friend.id ? "selected" : ""
                }`}
                onClick={() => setSelectedFriend(friend)}
              >
                <div className="friend-avatar">
                  <span
                    className={`status-dot ${isOnline ? "online" : "offline"}`}
                  ></span>
                </div>
                <div className="friend-info">
                  <p className="name">{friend.name}</p>
                  <p className="status">
                    {isOnline
                      ? "Online 🟢"
                      : `Last seen ⏰ ${friend.lastSeen || "unknown"}`}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p style={{ padding: "1rem" }}>No friends found</p>
        )}
      </div>
    </div>
  );
};

export default FriendsList;
