import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { ADDTOCART, LOGIN } from "../constant/ApiRoutes";
import { ShowErrorToast, ShowSuccessToast } from "../helper/helper";
import i18n from "../i18n";
import { ADDCART, DEC, DELITEM, INC, UPDATEQTY } from "../redux/cart/CartSlice";
import { useDispatch, useSelector } from "react-redux";

//create context
const AuthContext = createContext();

//auth provider
const AuthProvider = ({ children }) => {
  //states
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({});
  const [authLoading, setAuthLoading] = useState(null);
  const [userName, setUserName] = useState("");
  const [language, setLanguage] = useState(i18n.locale);
  const [cartLoading, setCartLoading] = useState(false);
  const { cartItem } = useSelector((state) => state?.cartItem);
  const dispatch = useDispatch();

  const checkItemInCart = (id) => {
    if (cartItem && cartItem?.length > 0) {
      return cartItem?.find((f) => f?._id === id);
    }
  };

  const changeLanguage = async (lang) => {
    i18n.locale = lang;
    setLanguage(lang);
    await AsyncStorage.setItem("lang", lang);
  };

  //load storage
  const loadStorageData = async () => {
    try {
      setAuthLoading(true);
      const AuthToken = await AsyncStorage.getItem("token");
      const UserData = await AsyncStorage.getItem("user_data");
      AuthToken ? setToken(AuthToken) : setToken(null);
      UserData ? setUserData(JSON.parse(UserData)) : setUserData({});
    } catch (error) {
      setToken(null);
    } finally {
      setAuthLoading(false);
    }
  };

  //sign in
  const signIn = async (data) => {
    // API CALL
    try {
      //create request data;
      const requestData = { ...data };
      //get response from api
      const response = await axios.post(LOGIN, requestData);

      //set response data
      if (response.data) {
        //destructure from response
        const { token, refresh_token, user } = response?.data?.payload;
        //set token and user_id in async storage
        AsyncStorage.setItem("token", token);
        AsyncStorage.setItem("refresh_token", refresh_token);
        AsyncStorage.setItem("user_data", JSON.stringify(user));
        setUserName(user?.name);

        ShowSuccessToast(response?.data?.message);
        //set state
        setToken(token);
        setUserData(data);
      }
    } catch (error) {
      ShowErrorToast(error?.response?.data?.message);
      console.log(error, "call error");
      console.log(error?.response, "call error");
      console.log(error?.response?.data, "call error");
    }
  };

  //sign out
  const signOut = async () => {
    setAuthLoading(true);

    //Token Remove, UserData Remove
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user_data");
    await AsyncStorage.removeItem("refresh_token");
    setToken(null);
    setAuthLoading(false);
  };

  const addCart = async (data) => {
    showLoader();
    try {
      const request = {
        product_id: data?._id,
        quantity: data?.qty,
      };

      const response = await axios.post(`${ADDTOCART}?payload=${JSON.stringify(request)}`);
      dispatch(
        ADDCART({
          ...data,
          qty: 1,
          cart_id: response?.data?.payload?.result?._id,
        })
      );
      setTimeout(() => {
        hideLoader();
      }, 1000);
    } catch (error) {
      hideLoader();
      ShowErrorToast(error?.response?.data?.message);
      console.log(error);
    }
  };

  const updateQty = async (val, id) => {
    try {
      const requestData = {
        _id: id,
        qty: Number(val),
      };

      dispatch(
        UPDATEQTY({
          ...requestData,
        })
      );
      
      const cartItem = checkItemInCart(id);
      const request = {
        quantity: val,
      };

      await axios.put(`${ADDTOCART}/${cartItem?.cart_id}?payload=${JSON.stringify(request)}`);
    } catch (error) {
      console.log(error);
    }
  };

  const addOffer = async (data) => {
    try {
      const cartItem = checkItemInCart(data?._id);
      const request = {
        selectedOffer: data?.selectedOffer || null,
      };

      await axios.put(`${ADDTOCART}/${cartItem?.cart_id}?payload=${JSON.stringify(request)}`);
    } catch (error) {
      console.log(error?.response?.data);
      ShowErrorToast(error?.response?.data?.message);
      console.log(error);
    }
  };

  const removeOffer = async (data) => {
    try {
      const cartItem = checkItemInCart(data?._id);
      const request = {
        selectedOffer: null,
      };

      await axios.put(`${ADDTOCART}/${cartItem?.cart_id}?payload=${JSON.stringify(request)}`);
    } catch (error) {
      console.log(error?.response?.data);
      ShowErrorToast(error?.response?.data?.message);
      console.log(error);
    }
  };

  const addQty = async (data) => {
    try {
      setCartLoading(true);
      const cartItem = checkItemInCart(data?._id);
      const request = {
        quantity: cartItem?.qty + 1,
      };

      await axios.put(`${ADDTOCART}/${cartItem?.cart_id}?payload=${JSON.stringify(request)}`);
      dispatch(INC(data));
      setCartLoading(false);
    } catch (error) {
      ShowErrorToast(error?.response?.data?.message);
      console.log(error);
      setCartLoading(false);
    }
  };

  const removeQty = async (data) => {
    try {
      setCartLoading(true);
      const cartItem = checkItemInCart(data?._id);
      const request = {
        quantity: cartItem?.qty - 1,
      };

      await axios.put(`${ADDTOCART}/${cartItem?.cart_id}?payload=${JSON.stringify(request)}`);
      dispatch(DEC(data));
      setCartLoading(false);
    } catch (error) {
      ShowErrorToast(error?.response?.data?.message);
      console.log(error);
      setCartLoading(false);
    }
  };

  const removeCartItem = async (data) => {
    try {
      const cartItem = checkItemInCart(data?._id);
      await axios.delete(`${ADDTOCART}/${cartItem?.cart_id}`);
      dispatch(DELITEM(data));
    } catch (error) {
      ShowErrorToast(error?.response?.data?.message);
      console.log(error);
    }
  };

  const showLoader = () => setLoading(true);
  const hideLoader = () => setLoading(false);

  //use effect
  useEffect(() => {
    loadStorageData();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        userData,
        authLoading,
        signOut,
        signIn,
        showLoader,
        hideLoader,
        loading,
        userName,
        setUserName,
        changeLanguage,
        language,
        addCart,
        addQty,
        removeQty,
        removeCartItem,
        addOffer,
        removeOffer,
        cartLoading,
        updateQty,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
