/* eslint-disable */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from '../../api/axios';
// Default friends if API fails
const defaultFriends = [
  { id: 1, name: "aden", online: true, lastSeen: null },
];

export const fetchFavorites = createAsyncThunk(
  "favorites/fetchFavorites",
  async (_, { rejectWithValue }) => {

     const token = window.sessionStorage.getItem("jwtToken");

    console.log("Stored token:", window.sessionStorage.getItem("jwtToken"));
    
    try {
    const response = await axios.get(
      "/customers/favorites",
      { headers: {  "Authorization": token,"Content-Type": "application/json" } }
    );

    const data = await response.data;
    return data;
  } catch (error) {
    console.log("##ERROR FETCHING FAVORITES", error);
    return defaultFriends; // fallback silently
  }
  }
);


// payload = product object or at least product ID
export const addFavorite = createAsyncThunk(
  "favorites/addFavorite",
  async (product, { rejectWithValue }) => {
    const token = window.sessionStorage.getItem("jwtToken");
    if (!token) {
      return rejectWithValue("No JWT token found");
    }

    try {
      const response = await axios.post(
        `/customers/favorites`,   // adjust endpoint if needed
        { productId: product.id }, // payload sent to backend
        {
          headers: {
            Authorization: token,   // raw JWT token
            "Content-Type": "application/json",
          },
        }
      );

      // Backend should return the added favorite or updated favorites list
      return response.data;
    } catch (error) {
      console.error("##ERROR ADDING FAVORITE", error);
      return rejectWithValue(error.response?.data || "Failed to add favorite");
    }
  }
);

// payload = product object or at least product ID
export const deleteFavorite = createAsyncThunk(
  "favorites/deleteFavorite",
  async (product, { rejectWithValue }) => {
    const token = window.sessionStorage.getItem("jwtToken");
    if (!token) {
      return rejectWithValue("No JWT token found");
    }

    try {
      const response = await axios.post(
        `/customers/favorites/delete`,   // adjust endpoint if needed
        { productId: product.id }, // payload sent to backend
        {
          headers: {
            Authorization: token,   // raw JWT token
            "Content-Type": "application/json",
          },
        }
      );

      // Backend should return the added favorite or updated favorites list
      return response.data;
    } catch (error) {
      console.error("##ERROR ADDING FAVORITE", error);
      return rejectWithValue(error.response?.data || "Failed to add favorite");
    }
  }
);


const favoritesSlice = createSlice({
  name: "favorites",
  initialState: { products: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      });
  },
});

export default favoritesSlice.reducer;
