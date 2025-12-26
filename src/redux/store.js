import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../redux/reducers/userSlice';
import friendsReducer from '../redux/reducers/friendsSlice';
import messagesReducer from '../redux/reducers/messagesSlice';
import productsReducer from '../redux/reducers/productsSlice';
import favoritseProduce from '../redux/reducers/favoritesSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    friends: friendsReducer,
    messages: messagesReducer,
    products: productsReducer,
    favorites: favoritseProduce,
  },
});
