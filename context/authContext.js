import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LOGIN } from "../constant/ApiRoutes";
import { ShowErrorToast, ShowSuccessToast } from "../helper/helper";
import i18n from "../i18n";

//create context
const AuthContext = createContext();

//auth provider
const AuthProvider = ({ children }) => {
  //states
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState({});
  const [authLoading, setAuthLoading] = useState(null);
  const [userName, setUserName] = useState("")
  const [language, setLanguage] = useState(i18n.locale);

  const changeLanguage = async(lang) => {
    i18n.locale = lang;
    setLanguage(lang);
    await AsyncStorage.setItem('lang', lang)
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
        setUserName(user?.name)

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
    setToken(null);
    setAuthLoading(false);
  };

  const showLoader = () => setLoading(true)
  const hideLoader = () => setLoading(false)

  //use effect
  useEffect(() => {
    loadStorageData();
  }, []);

  return (
    <AuthContext.Provider value={{ token, userData, authLoading, signOut, signIn, showLoader, hideLoader, loading, userName, setUserName, changeLanguage, language}}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
