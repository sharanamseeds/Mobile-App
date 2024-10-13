import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, Image, TouchableOpacity, Text } from "react-native";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import ThemeSafeAreaView from "../../components/ThemeSafeAreaView";
import { Colors } from "../../constant/Colors";
import { useThemeColor } from "../../hook/useThemeColor";
import ButtonPrimary from "../../components/ButtonPrimary";
import FloatingInput from "../../components/FloatingInput";
import FloatingPasswordInput from "../../components/FloatingPasswordInput";
import axios from "axios";
import {
  CHANGEPASSWORD,
  RESENDOTP,
  SENDVERIFICATIONCODE,
  VERIFYVERIFICATIOCODE,
} from "../../constant/ApiRoutes";
import { ShowErrorToast, ShowSuccessToast } from "../../helper/helper";
import { AuthContext } from "../../context/authContext";
import i18n from "../../i18n";

const ForgotPassword = ({ navigation }) => {
  const primaryColor = useThemeColor({}, "primary");
  const subTitleColor = useThemeColor({}, "subTitle");

  const [formDetail, setFormDetail] = useState({});
  const [showVerificationCode, setShowVerificationCode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [time, setTime] = useState(0);
  const { showLoader, hideLoader } = useContext(AuthContext);

  const handleChange = (name, value) => {
    setFormDetail({ ...formDetail, [name]: value });
  };

  // Convert seconds into MM:SS format
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const validation = () => {
    const { email, verification_code, password } = formDetail;
    let isError = false;
    let error = {};
    if (showVerificationCode && !showPassword && time === 0 && !email) {
      error = { ...error, email: "please enter email" };
      isError = true;
    } else {
      error = { ...error, email: "" };
    }
    if (showVerificationCode && !showPassword && time !== 0 && !verification_code) {
      error = { ...error, verification_code: "please enter verification code" };
      isError = true;
    } else {
      error = { ...error, verification_code: "" };
    }
    if (showVerificationCode && !showPassword && !email) {
      error = { ...error, email: "please enter email" };
      isError = true;
    } else {
      error = { ...error, email: "" };
    }
    if (showVerificationCode && !showPassword && !verification_code) {
      error = { ...error, verification_code: "please enter verification code" };
      isError = true;
    } else {
      error = { ...error, verification_code: "" };
    }
    if (showVerificationCode && showPassword && !password) {
      error = { ...error, password: "please enter password" };
      isError = true;
    } else {
      error = { ...error, password: "" };
    }
    if (showVerificationCode && showPassword && !email) {
      error = { ...error, email: "please enter email" };
      isError = true;
    } else {
      error = { ...error, email: "" };
    }
    if (!showVerificationCode && !showPassword && !email) {
      error = { ...error, email: "please enter email" };
      isError = true;
    } else {
      error = { ...error, email: "" };
    }

    setErrors(error)
    return isError
  };

  const sendVerificationCode = async () => {
    if (!validation()) {
      try {
        showLoader();
        const response = await axios.post(SENDVERIFICATIONCODE, { email: formDetail?.email });
        ShowSuccessToast(response.data?.message);
        setShowVerificationCode(true);
        setTime(90);
        hideLoader();
      } catch (error) {
        ShowErrorToast(error?.response?.data?.message);
        hideLoader();
        console.log(error?.response?.data?.message);
      }
    }
  };

  const verifyVerificationCode = async () => {
    if (!validation()) {
      try {
        showLoader();
        const responseData = {
          email: formDetail?.email,
          verification_code: formDetail?.verification_code,
        };
        const response = await axios.post(VERIFYVERIFICATIOCODE, responseData);
        ShowSuccessToast(response.data?.message);
        setShowPassword(true);
        hideLoader();
      } catch (error) {
        ShowErrorToast(error?.response?.data?.message);
        console.log(error?.response?.data);
        hideLoader();
      }
    }
  };

  const resendOtp = async () => {
    if (!validation()) {
      try {
        showLoader();
        const responseData = {
          email: formDetail?.email,
        };
        const response = await axios.post(RESENDOTP, responseData);
        ShowSuccessToast(response.data?.message);
        hideLoader();
      } catch (error) {
        ShowErrorToast(error?.response?.data?.message);
        hideLoader();
        console.log(error);
      }
    }
  };

  const changePassword = async () => {
    if (!validation()) {
      try {
        showLoader();
        const responseData = {
          email: formDetail?.email,
          new_password: formDetail?.password,
          confirm_password: formDetail?.password,
        };
        const response = await axios.post(CHANGEPASSWORD, responseData);
        ShowSuccessToast(response.data?.message);
        navigation.navigate("Login");
        hideLoader();
      } catch (error) {
        ShowErrorToast(error?.response?.data?.message);
        hideLoader();
        console.log(error);
      }
    }
  };

  useEffect(() => {
    if (time === 0) return;

    const timerId = setInterval(() => {
      setTime((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timerId); // Cleanup the interval on component unmount
  }, [time]);

  return (
    <ThemeSafeAreaView isReloadable={false}>
      <ThemedView style={styles.topContainer}>
        <Image
          style={styles.image}
          source={{
            uri: "https://res.cloudinary.com/dztl85wyk/image/upload/v1717309940/my-folder/ugngkkhsupehzqipgcoa.png",
          }}
        />
      </ThemedView>
      <ThemedView style={styles.bottomContainer}>
        <ThemedText style={{ ...styles.title, color: primaryColor, fontFamily: "PoppinsBold" }}>
          {i18n.t('forgot')},
        </ThemedText>
        <ThemedText style={{ ...styles.subtitle, color: subTitleColor }}>
          {i18n.t('reset')}
        </ThemedText>

        <FloatingInput
          label={i18n.t('email')}
          name={"email"}
          formDetail={formDetail}
          handleChange={handleChange}
          error={errors?.email}
        />

        {showVerificationCode && (
          <>
            <FloatingInput
              label={i18n.t('verification_code')}
              name={"verification_code"}
              formDetail={formDetail}
              handleChange={handleChange}
              error={errors?.verification_code}
            />
            {time === 0 ? (
              <TouchableOpacity onPress={() => resendOtp()}>
                <Text
                  style={{
                    color: primaryColor,
                    textAlign: "right",
                    marginTop: -15,
                    marginBottom: 15,
                    fontSize: 18,
                  }}
                >
                  Resend Otp
                </Text>
              </TouchableOpacity>
            ) : (
              <Text
                style={{
                  color: primaryColor,
                  textAlign: "right",
                  marginTop: -15,
                  marginBottom: 15,
                  fontSize: 18,
                }}
              >
                {formatTime(time)}
              </Text>
            )}
          </>
        )}

        {showPassword && (
          <FloatingPasswordInput
            label={i18n.t('password')}
            name={"password"}
            formDetail={formDetail}
            handleChange={handleChange}
            error={errors?.password}
          />
        )}

        <ButtonPrimary
          title={i18n.t('submit')}
          handlePress={() =>
            showVerificationCode && !showPassword
              ? verifyVerificationCode()
              : showPassword
              ? changePassword()
              : sendVerificationCode()
          }
        />

        <ThemedView style={styles.signupContainer}>
          <ThemedText>{i18n.t('back_to')}? </ThemedText>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <ThemedText style={{ ...styles.signupText, color: primaryColor }}>{i18n.t('sign_in')}</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ThemeSafeAreaView>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  topContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomContainer: {
    flex: 2,
    paddingHorizontal: 20,
  },
  image: {
    width: 350,
    height: 350,
    resizeMode: "contain",
  },
  title: {
    fontSize: 22,
    marginTop: 20,
    color: Colors,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  googleButton: {
    backgroundColor: "#4285F4",
    borderRadius: 5,
    marginBottom: 20,
  },
  googleIcon: {
    marginRight: 10,
  },
  orText: {
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  forgotPasswordText: {
    textAlign: "right",
    marginBottom: 20,
  },
  signInButton: {
    backgroundColor: "#FF6F61",
    borderRadius: 5,
    height: 50,
    justifyContent: "center",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  signupText: {
    color: "#4285F4",
  },
});
