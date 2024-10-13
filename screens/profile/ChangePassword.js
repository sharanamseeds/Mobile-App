import { useContext, useState } from "react";
import FloatingInput from "../../components/FloatingInput";
import FloatingPasswordInput from "../../components/FloatingPasswordInput";
import { ThemedView } from "../../components/ThemedView";
import ThemeSafeAreaView from "../../components/ThemeSafeAreaView";
import ButtonPrimary from "../../components/ButtonPrimary";
import { AuthContext } from "../../context/authContext";
import axios from "axios";
import { CHANGEPASSWORD } from "../../constant/ApiRoutes";
import i18n from "../../i18n";

const ChangePassword = () => {
  const [formDetail, setFormDetail] = useState({});
  const [error, setError] = useState({});
  const { showLoader, hideLoader } = useContext(AuthContext);

  const handleChange = (name, value) => {
    setFormDetail({ ...formDetail, [name]: value });
  };

  const validate = () => {
    let isError = false;
    let errors = {};

    const { confirm_password, new_password } = formDetail;

    if (!new_password) {
      errors = { ...errors, new_password: "please enter new password" };
      isError = true;
    } else {
      errors = { ...errors, new_password: "" };
    }
    if (!confirm_password) {
      errors = { ...errors, confirm_password: "please enter confirm password" };
      isError = true;
    } else if (new_password !== confirm_password) {
      errors = { ...errors, confirm_password: "confirm password is not same" };
      isError = true;
    } else {
      errors = { ...errors, confirm_password: "" };
    }

    setError(errors);
    return isError;
  };

  const handlePress = async () => {
    if (!validate()) {
      showLoader();
      const response = await axios.post(`${CHANGEPASSWORD}?lang_code=${i18n.locale}`, formDetail)
      try {
      } catch (error) {
        console.log(error?.response?.data?.message);
        hideLoader();
      }
    }
  };

  return (
    <ThemeSafeAreaView style={{ paddingHorizontal: 15, marginTop: 15 }} isReloadable={false}>
      <ThemedView>
        <FloatingInput
          label={i18n.t('new_password')}
          name={"new_password"}
          formDetail={formDetail}
          handleChange={handleChange}
          error={error?.new_password}
        />

        <FloatingPasswordInput
          label={i18n.t('confirm_password')}
          name={"confirm_password"}
          formDetail={formDetail}
          handleChange={handleChange}
          error={error?.confirm_password}
        />

        <ButtonPrimary title={i18n.t('change_password')} handlePress={() => handlePress()} />
      </ThemedView>
    </ThemeSafeAreaView>
  );
};

export default ChangePassword;
