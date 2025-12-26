import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Default friends if API fails
const defaultFriends = [
  { id: 1, name: "aden", online: true, lastSeen: null },
  { id: 2, name: "rashka", online: false, lastSeen: "10 min ago" },
];

export const fetchFriends = createAsyncThunk(
  "friends/fetchFriends",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/friends");
      if (!response.ok) throw new Error("Failed to fetch friends");
      const data = await response.json();
      return data;
    } catch (error) {
      return defaultFriends; // fallback silently
    }
  }
);

const friendsSlice = createSlice({
  name: "friends",
  initialState: { friends: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFriends.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFriends.fulfilled, (state, action) => {
        state.loading = false;
        state.friends = action.payload;
      });
  },
});

export default friendsSlice.reducer;
