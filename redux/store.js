import { configureStore,combineReducers } from '@reduxjs/toolkit';
import CARTREDUCER from './cart/CartSlice';

const reducer = combineReducers({
    cartItem: CARTREDUCER
})

const store = configureStore({
    reducer
});

export default store;