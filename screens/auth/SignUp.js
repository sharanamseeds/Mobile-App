import React, { useContext, useState } from "react";
import { StyleSheet, Image, TouchableOpacity } from "react-native";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import ThemeSafeAreaView from "../../components/ThemeSafeAreaView";
import { Colors } from "../../constant/Colors";
import { useThemeColor } from "../../hook/useThemeColor";
import ButtonPrimary from "../../components/ButtonPrimary";
import FloatingInput from "../../components/FloatingInput";
import FloatingPasswordInput from "../../components/FloatingPasswordInput";
import axios from "axios";
import { REGISTER } from "../../constant/ApiRoutes";
import { AuthContext } from "../../context/authContext";
import { ShowErrorToast, ShowSuccessToast } from "../../helper/helper";
import i18n from "../../i18n";

const SignUp = ({ navigation }) => {
  const primaryColor = useThemeColor({}, "primary");
  const subTitleColor = useThemeColor({}, "subTitle");
  const { showLoader, hideLoader } = useContext(AuthContext);

  const [formDetail, setFormDetail] = useState({});
  const [error, setError] = useState({})

  const handleChange = (name, value) => {
    setFormDetail({ ...formDetail, [name]: value });
  };

  const validate = () => {
    let isError = false
    let errors = {}
    
    const {name, email, password} = formDetail

    if (!name) {
      errors = {...errors, "name": 'please enter name'}
      isError = true
    } else {
      errors = {...errors, "name": ''}
    }
    if (!email) {
      errors = {...errors, "email": "please enter email"}
      isError = true
    } else {
      errors = {...errors, "email": ""}
    }
    if (!password) {
      errors = {...errors, "password": "please enter password"}
      isError = true
    } else {
      errors = {...errors, "password": ""}
    }

    setError(errors)
    return isError
  }

  const registerUser = async() => {
    if(!validate()){
      try {
        showLoader()
        const result = await axios.post(REGISTER, {...formDetail, confirm_password: formDetail?.password, gst_number: "2412dr2t1reqwer"})
        ShowSuccessToast(result?.data?.message)
        hideLoader()
      } catch(error) {
        ShowErrorToast(error?.response?.data?.message)
        console.log(error?.response?.data)
        hideLoader()
      }
    }
  }
 
  return (
    <ThemeSafeAreaView>
      <ThemedView style={styles.topContainer}>
        <Image
          style={styles.image}
          source={{
            uri: "https://res.cloudinary.com/dztl85wyk/image/upload/v1717309940/my-folder/uhpezoy7wyd8soajfqsn.png",
          }}
        />
      </ThemedView>
      <ThemedView style={styles.bottomContainer}>
        <ThemedText style={{ ...styles.title, color: primaryColor, fontFamily: "PoppinsBold" }}>
          {i18n.t('create')},
        </ThemedText>
        <ThemedText style={{ ...styles.subtitle, color: subTitleColor }}>
         {i18n.t('discover')},
        </ThemedText>

        <FloatingInput
          label={i18n.t('name')}
          name={"name"}
          formDetail={formDetail}
          handleChange={handleChange}
          error={error?.name}
        />

        <FloatingInput
          label={i18n.t('email')}
          name={"email"}
          formDetail={formDetail}
          handleChange={handleChange}
          error={error?.email}
        />

        <FloatingPasswordInput
          label={i18n.t('password')}
          name={"password"}
          formDetail={formDetail}
          handleChange={handleChange}
          error={error?.password}
        />

        <ButtonPrimary title={i18n.t('sign_up')} handlePress={registerUser}/>

        <ThemedView style={styles.signupContainer}>
          <ThemedText>{i18n.t('already_member')}? </ThemedText>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <ThemedText style={{ ...styles.signupText, color: primaryColor }}>{i18n.t('sign_in')}</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ThemeSafeAreaView>
  );
};

export default SignUp;

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
});
