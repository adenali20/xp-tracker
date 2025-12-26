import { createSlice } from "@reduxjs/toolkit";

const messagesSlice = createSlice({
  name: "messages",
  initialState: {
    list: [], // flat array of all messages
  },
  reducers: {
    setMessages: (state, action) => {
      state.list = action.payload; // set all messages
    },
    addMessage: (state, action) => {
      state.list.push(action.payload); // add a single message
    },
    clearMessages: (state) => {
      state.list = [];
    },
  },
});

export const { setMessages, addMessage, clearMessages } = messagesSlice.actions;
export default messagesSlice.reducer;
