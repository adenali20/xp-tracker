import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Default friends to use if API fails
const defaultFriends = [
  { id: 1, name: "John Doe", online: true, lastSeen: null },
  { id: 2, name: "Sarah Lee", online: false, lastSeen: "10 min ago" },
  { id: 3, name: "Alex Kim", online: false, lastSeen: "2 hours ago" },
  { id: 4, name: "Nina Patel", online: true, lastSeen: null },
  { id: 5, name: "Mike Johnson", online: false, lastSeen: "5 min ago" },
];

export const fetchFriends = createAsyncThunk(
  "friends/fetchFriends",
  async (_) => {
    try {
      const response = await fetch("/api/friends");
      if (!response.ok) throw new Error("Failed to fetch friends");
      const data = await response.json();
      return data; // real API data
    } catch (error) {
      // Silently return default friends if API fails
      return defaultFriends;
    }
  }
);

const initialState = {
  friends: [],
  loading: false,
};

const friendsSlice = createSlice({
  name: "friends",
  initialState,
  reducers: {
    addFriend(state, action) {
      state.friends.push(action.payload);
    },
    removeFriend(state, action) {
      state.friends = state.friends.filter(f => f.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFriends.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFriends.fulfilled, (state, action) => {
        state.loading = false;
        state.friends = action.payload; // API data or default friends
      });
  },
});

export const { addFriend, removeFriend } = friendsSlice.actions;
export default friendsSlice.reducer;
