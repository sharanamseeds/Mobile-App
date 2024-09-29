import { useContext, useEffect, useState } from "react";
import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";
import ThemeSafeAreaView from "../../components/ThemeSafeAreaView";
import FloatingInput from "../../components/FloatingInput";
import { AuthContext } from "../../context/authContext";
import axios from "axios";
import { UPDATEUSER } from "../../constant/ApiRoutes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ButtonPrimary from "../../components/ButtonPrimary";
import { Dimensions, ScrollView } from "react-native";
import { ShowErrorToast, ShowSuccessToast } from "../../helper/helper";
import i18n from "../../i18n";

const ProfileEdit = () => {
  const [formDetail, setFormDetail] = useState({});
  const [error, setError] = useState({});
  const screenHeight = Dimensions.get("window").height;
  const { showLoader, hideLoader } = useContext(AuthContext);

  const handleChange = (name, value) => {
    setFormDetail({ ...formDetail, [name]: value });
  };

  const getUserDetail = async () => {
    showLoader();
    const userData = (await AsyncStorage.getItem("user_data"))
      ? JSON.parse(await AsyncStorage.getItem("user_data"))
      : {};
    try {
      const response = await axios.get(`${UPDATEUSER}/${userData?._id}?lang_code=${i18n.locale}`);
      const resultData = response.data?.payload?.result;
      setFormDetail({
        ...resultData,
        b_address_line: resultData?.billing_address?.address_line,
        b_city: resultData?.billing_address?.city,
        b_state: resultData?.billing_address?.state,
        b_pincode: resultData?.billing_address?.pincode,
        s_address_line: resultData?.shipping_address?.address_line,
        s_city: resultData?.shipping_address?.city,
        s_state: resultData?.shipping_address?.state,
        s_pincode: resultData?.shipping_address?.pincode,
      });
      hideLoader();
    } catch (error) {
      hideLoader();
      console.log(error, "error");
    }
  };

  const validate = () => {
    let isError = false;
    let errors = {};

    const {
      name,
      agro_name,
      contact_number,
      email,
      gst_number,
      b_address_line,
      b_city,
      b_state,
      b_pincode,
      s_address_line,
      s_city,
      s_state,
      s_pincode,
    } = formDetail;

    if (!name) {
      console.log("in if")
      errors = { ...errors, name: "please enter name" };
      isError = true;
    } else {
      errors = { ...errors, name: "" }
    }
    if (!agro_name) {
      errors = { ...errors, agro_name: "please enter firm name" };
      isError = true;
    } else {
      errors = { ...errors, agro_name: "" }
    }
    if (!contact_number) {
      errors = { ...errors, contact_number: "please enter contact number" };
      isError = true;
    } else {
      errors = { ...errors, contact_number: "" }
    }
    if (!email) {
      errors = { ...errors, email: "please enter email" };
      isError = true;
    } else {
      errors = { ...errors, email: "" }
    }
    if (!b_address_line) {
      errors = { ...errors, b_address_line: "please enter address line" };
      isError = true;
    } else {
      errors = { ...errors, b_address_line: "" }
    }
    if (!b_city) {
      errors = { ...errors, b_city: "please enter city" };
      isError = true;
    } else {
      errors = { ...errors, b_city: "" }
    }
    if (!b_state) {
      errors = { ...errors, b_state: "please enter state" };
      isError = true;
    } else {
      errors = { ...errors, b_state: "" }
    }
    if (!b_pincode) {
      errors = { ...errors, b_pincode: "please enter pincode" };
      isError = true;
    } else {
      errors = { ...errors, b_pincode: "" }
    }
    if (!s_address_line) {
      errors = { ...errors, s_address_line: "please enter address line" };
      isError = true;
    } else {
      errors = { ...errors, s_address_line: "" }
    }
    if (!s_city) {
      errors = { ...errors, s_city: "please enter city" };
      isError = true;
    } else {
      errors = { ...errors, s_city: "" }
    }
    if (!s_state) {
      errors = { ...errors, s_state: "please enter state" };
      isError = true;
    } else {
      errors = { ...errors, s_state: "" }
    }
    if (!s_pincode) {
      errors = { ...errors, s_pincode: "please enter pincode" };
      isError = true;
    } else {
      errors = { ...errors, s_pincode: "" }
    }

    setError(errors);
    return isError;
  };

  const updateProfile = async () => {
    if (!validate()) {
      showLoader();
      try {
        const userData = (await AsyncStorage.getItem("user_data"))
          ? JSON.parse(await AsyncStorage.getItem("user_data"))
          : {};
        const {
          name,
          agro_name,
          contact_number,
          email,
          gst_number,
          b_address_line,
          b_city,
          b_state,
          b_pincode,
          s_address_line,
          s_city,
          s_state,
          s_pincode,
        } = formDetail;
        const params = {
          name,
          agro_name,
          contact_number,
          email,
          gst_number,
          billing_address: {
            address_line: b_address_line,
            city: b_city,
            state: b_state,
            pincode: b_pincode,
          },
          shipping_address: {
            address_line: s_address_line,
            city: s_city,
            state: s_state,
            pincode: s_pincode,
          },
        };
        const response = await axios.put(
          `${UPDATEUSER}/${userData?._id}?payload=${JSON.stringify(params)}&lang_code=${i18n.locale}`
        );
        if (response.data) {
          ShowSuccessToast(response?.data?.message);
        }
        hideLoader();
      } catch (error) {
        hideLoader();
        ShowErrorToast(error?.response?.data?.message);
      }
    }
  };

  useEffect(() => {
    getUserDetail();
  }, []);

  return (
    <ThemeSafeAreaView style={{ flex: 1, paddingHorizontal: 15 }}>
      <ThemedView style={{ flex:1, marginTop: 20, marginBottom: 60}}>
        <ScrollView showsVerticalScrollIndicator={false} style={{ height: screenHeight * 0.79 }}>
          <ThemedText style={{ marginBottom: 15 }}>{i18n.t('profile_detail')}</ThemedText>
          <FloatingInput
            label={i18n.t('full_name')}
            name={"name"}
            formDetail={formDetail}
            handleChange={handleChange}
            error={error?.name}
          />
          <FloatingInput
            label={i18n.t('firm_name')}
            name={"agro_name"}
            formDetail={formDetail}
            handleChange={handleChange}
            error={error?.agro_name}
          />
          <FloatingInput
            label={i18n.t('phone')}
            name={"contact_number"}
            formDetail={formDetail}
            handleChange={handleChange}
            error={error?.contact_number}
          />
          <FloatingInput
            label={i18n.t('email')}
            name={"email"}
            formDetail={formDetail}
            handleChange={handleChange}
            error={error?.email}
          />
          <FloatingInput
            label={i18n.t('gst')}
            name={"gst_number"}
            formDetail={formDetail}
            handleChange={handleChange}
            error={error?.gst_number}
          />
          <ThemedText style={{ marginBottom: 15 }}>{i18n.t('billing_address')}</ThemedText>
          <FloatingInput
            label={i18n.t('address')}
            name={"b_address_line"}
            formDetail={formDetail}
            handleChange={handleChange}
            error={error?.b_address_line}
          />
          <FloatingInput
            label={i18n.t('city')}
            name={"b_city"}
            formDetail={formDetail}
            handleChange={handleChange}
            error={error?.b_city}
          />
          <FloatingInput
            label={i18n.t('state')}
            name={"b_state"}
            formDetail={formDetail}
            handleChange={handleChange}
            error={error?.b_state}
          />
          <FloatingInput
            label={i18n.t('pincode')}
            name={"b_pincode"}
            formDetail={formDetail}
            handleChange={handleChange}
            error={error?.b_pincode}
          />
          <ThemedText style={{ marginBottom: 15 }}>{i18n.t('shipping_address')}</ThemedText>
          <FloatingInput
            label={i18n.t('address')}
            name={"s_address_line"}
            formDetail={formDetail}
            handleChange={handleChange}
            error={error?.s_address_line}
          />
          <FloatingInput
            label={i18n.t('city')}
            name={"s_city"}
            formDetail={formDetail}
            handleChange={handleChange}
            error={error?.s_city}
          />
          <FloatingInput
            label={i18n.t('state')}
            name={"s_state"}
            formDetail={formDetail}
            handleChange={handleChange}
            error={error?.s_state}
          />
          <FloatingInput
            label={i18n.t('pincode')}
            name={"s_pincode"}
            formDetail={formDetail}
            handleChange={handleChange}
            error={error?.s_pincode}
          />
        </ScrollView>
      </ThemedView>
      <ButtonPrimary
        title={i18n.t('update_profile')}
        style={{ position: "absolute", bottom: 0, width: "100%" }}
        handlePress={updateProfile}
      />
    </ThemeSafeAreaView>
  );
};

export default ProfileEdit;
