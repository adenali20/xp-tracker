import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../redux/reducers/userSlice';
import friendsReducer from '../redux/reducers/friendsSlice';
import messagesReducer from '../redux/reducers/messagesSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    friends: friendsReducer,
    messages: messagesReducer,
  },
});
