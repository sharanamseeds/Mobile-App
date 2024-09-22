import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, Image, TouchableOpacity, Text, Modal, View } from "react-native";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import ThemeSafeAreaView from "../../components/ThemeSafeAreaView";
import { Colors } from "../../constant/Colors";
import { useThemeColor } from "../../hook/useThemeColor";
import ButtonPrimary from "../../components/ButtonPrimary";
import FloatingInput from "../../components/FloatingInput";
import { AuthContext } from "../../context/authContext";
import FloatingPasswordInput from "../../components/FloatingPasswordInput";
import i18n from "../../i18n";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Login = ({ navigation }) => {
  const primaryColor = useThemeColor({}, "primary");
  const subTitleColor = useThemeColor({}, "subTitle");
  const textColor = useThemeColor({}, "text");
  const boxColor = useThemeColor({}, "boxColor");
  const boxShadow = useThemeColor({}, "boxShadow");
  const { changeLanguage, signIn, showLoader, hideLoader } = useContext(AuthContext);
  const Languages = [
    {
      lang: "English",
      code: "en",
    },
    {
      lang: "हिन्दी",
      code: "hi",
    },
    {
      lang: "ગુજરાતી",
      code: "gu",
    },
  ];

  const [formDetail, setFormDetail] = useState({});
  const [error, setError] = useState({});
  const [modalVisible, setModalVisible] = useState(false);

  const handleChange = (name, value) => {
    setFormDetail({ ...formDetail, [name]: value });
  };

  const validate = () => {
    let isError = false;
    let errors = {};

    const { email, password } = formDetail;

    if (!email) {
      errors = { ...errors, email: "please enter email" };
      isError = true;
    } else {
      errors = { ...errors, email: "" };
    }
    if (!password) {
      errors = { ...errors, password: "please enter password" };
      isError = true;
    } else {
      errors = { ...errors, password: "" };
    }

    setError(errors);
    return isError;
  };

  const handlePress = async () => {
    if (!validate()) {
      showLoader();
      await signIn(formDetail);
      hideLoader();
    }
  };

  const checkLanguage = async() => {
    const language = await AsyncStorage.getItem('lang')
    if (!language) {
      setModalVisible(true)
    }
  }

  useEffect(() => {
    checkLanguage()
  }, [])

  return (
    <ThemeSafeAreaView>
      <ThemedView style={styles.topContainer}>
        <Image
          style={styles.image}
          source={{
            uri: "https://res.cloudinary.com/dztl85wyk/image/upload/v1717309940/my-folder/v8skqsx4srjvrd8ekp5e.png",
          }}
        />
      </ThemedView>
      <ThemedView style={styles.bottomContainer}>
        <ThemedText style={{ ...styles.title, color: primaryColor, fontFamily: "PoppinsBold" }}>
          {i18n.t("welcome")},
        </ThemedText>
        <ThemedText style={{ ...styles.subtitle, color: subTitleColor }}>
         {i18n.t("discover")},
        </ThemedText>

        <FloatingInput
          label={i18n.t("email")}
          name={"email"}
          formDetail={formDetail}
          handleChange={handleChange}
          error={error?.email}
        />

        <FloatingPasswordInput
          label={i18n.t("password")}
          name={"password"}
          formDetail={formDetail}
          handleChange={handleChange}
          error={error?.password}
        />

        <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
          <ThemedText style={{ ...styles.forgotPasswordText, color: primaryColor }}>
            {i18n.t("forgot")}?
          </ThemedText>
        </TouchableOpacity>
        <ButtonPrimary title={i18n.t("sign_in")} handlePress={() => handlePress()} />

        <ThemedView style={styles.signupContainer}>
          <ThemedText>{i18n.t('new_member')}? </ThemedText>
          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <ThemedText style={{ ...styles.signupText, color: primaryColor }}>{i18n.t('sign_up')}</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View
            style={{
              ...styles.modalView,
              backgroundColor: boxColor,
              shadowColor: boxShadow,
              height: "100%",
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 15 }}>
              <Text
                style={{ color: textColor, fontSize: 25, fontWeight: 600, color: primaryColor }}
              >
                Select Language
              </Text>
            </View>
            <View style={{ marginTop: 15 }}>
              {Languages.map((language, index) => (
                <TouchableOpacity
                  style={{
                    ...styles.carContainer,
                    backgroundColor: "#FFF",
                    shadowColor: boxShadow,
                  }}
                  onPress={() => {
                    changeLanguage(language?.code);
                    setModalVisible(false);
                  }}
                  key={index}
                >
                  <View style={{ ...styles.card }}>
                    <View style={styles.cardDetail}>
                      <ThemedText style={{ color: primaryColor, fontSize: 25 }}>
                        {language?.lang}
                      </ThemedText>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </ThemeSafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  topContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  image: {
    width: 350,
    height: 300,
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
  modalView: {
    borderRadius: 0,
    paddingHorizontal: 15,
    paddingVertical: 20,
    bottom: 0,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    height: "60%",
  },
  centeredView: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  carContainer: {
    flexDirection: "column",
    marginBottom: 10,
    padding: 10,
    marginTop: 5,
    marginHorizontal: 1,
    borderRadius: 50,
    // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    // Android shadow
    elevation: 3,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardDetail: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
});
