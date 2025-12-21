/* eslint-disable */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from '../../api/axios';
// Default friends if API fails
const defaultFriends = [
  { id: 1, name: "aden", online: true, lastSeen: null },
];

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (_, { rejectWithValue }) => {

     const token = window.sessionStorage.getItem("jwtToken");

    console.log("Stored token:", window.sessionStorage.getItem("jwtToken"));
    
    try {
    const response = await axios.get(
      "/products",
      { headers: {  "Authorization": token,"Content-Type": "application/json" } }
    );

    const data = await response.data;
    return data;
  } catch (error) {
    console.log("##ERROR FETCHING PRODUCTS", error);
    return defaultFriends; // fallback silently
  }
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState: { products: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      });
  },
});

export default productsSlice.reducer;
