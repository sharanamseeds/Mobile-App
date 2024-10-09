import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartItem: [],
  isLoding: true,
};

export const counterSlice = createSlice({
  name: "cartItem",
  initialState,
  reducers: {
    ADDCART: (state, action) => {
      let isPresent =
        state.cartItem.findIndex((product) => product._id === action.payload._id) !== -1;
      if (isPresent) {
        let updateddata = state.cartItem.map((curval) => {
          if (curval._id === action.payload._id) {
            if (curval.total_qty > action.payload.qty) {
              return { ...curval, qty: curval.qty + action.payload.qty };
            }
          }
          return curval;
        });
        state.cartItem = [...updateddata];
        AsyncStorage.setItem("cartdata", JSON.stringify(state.cartItem));
      } else {
        state.cartItem = [...state.cartItem, action.payload];
        AsyncStorage.setItem("cartdata", JSON.stringify(state.cartItem));
      }
    },
    INC: (state, action) => {
      let updateddata = state.cartItem.map((curval) => {
        if (curval._id === action.payload._id) {
          return { ...curval, qty: curval.qty + 1 };
        }
        return curval;
      });

      state.cartItem = [...updateddata];
      AsyncStorage.setItem("cartdata", JSON.stringify(state.cartItem));
    },
    DEC: (state, action) => {
      let updateddata = state.cartItem.map((curval) => {
        if (curval._id === action.payload._id) {
          return { ...curval, qty: curval.qty - 1 };
        }
        return curval;
      });

      state.cartItem = [...updateddata];
      AsyncStorage.setItem("cartdata", JSON.stringify(state.cartItem));
    },
    DELITEM: (state, action) => {
      const productexist = state.cartItem.filter((item) => item._id === action.payload._id);
      if (productexist) {
        state.cartItem = state.cartItem.filter((item) => item._id !== action.payload._id);
        AsyncStorage.setItem("cartdata", JSON.stringify(state.cartItem));
      }
    },
    REMOVEOFFER: (state, action) => {
      const productexist = state.cartItem.find((item) => item._id === action.payload._id);
      if (productexist) {
        let updateddata = state.cartItem.map((curval) => {
          if (curval._id === action.payload._id) {
            return { ...curval, selectedOffer: null };
          }
          return curval;
        });
        state.cartItem = [...updateddata];
        AsyncStorage.setItem("cartdata", JSON.stringify(state.cartItem));
      }
    },
    ADDOFFER: (state, action) => {
      const productexist = state.cartItem.find((item) => item._id === action.payload._id);
      if (productexist) {
        let updateddata = state.cartItem.map((curval) => {
          if (curval._id === action.payload._id) {
            return { ...curval, selectedOffer: action.payload?.selectedOffer };
          }
          return curval;
        });
        state.cartItem = [...updateddata];
        AsyncStorage.setItem("cartdata", JSON.stringify(state.cartItem));
      }
    },
    REMOVECARTITEM: (state, action) => {
      state.cartItem = [];
      AsyncStorage.setItem("cartdata", JSON.stringify(state.cartItem));
    },
    SETCARTITEM: (state, action) => {
      state.cartItem = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { INC, DEC, ADDCART, DELITEM, REMOVECARTITEM, SETCARTITEM, REMOVEOFFER, ADDOFFER } = counterSlice.actions;

export default counterSlice.reducer;
