import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../redux/reducers/userSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
});
