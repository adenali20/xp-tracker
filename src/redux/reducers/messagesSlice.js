import { createSlice } from "@reduxjs/toolkit";

const messagesSlice = createSlice({
  name: "messages",
  initialState: {
    byUser: {}, // { friendUsername: [messages...] }
  },
  reducers: {
    addMessage: (state, action) => {
      const { friend, message } = action.payload;
      if (!state.byUser[friend]) {
        state.byUser[friend] = [];
      }
      state.byUser[friend].push(message);
    },
    setMessages: (state, action) => {
      const { friend, messages } = action.payload;
      state.byUser[friend] = messages;
    },
    clearMessages: (state) => {
      state.byUser = {};
    },
  },
});

export const { addMessage, setMessages, clearMessages } = messagesSlice.actions;
export default messagesSlice.reducer;
