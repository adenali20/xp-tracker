import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../redux/reducers/userSlice';
import friendsReducer from '../redux/reducers/friendsSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    friends: friendsReducer,
  },
});
