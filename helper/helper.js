import Toast from "react-native-toast-message";
import { APP_IMAGE_BASE_URL } from "../config/setting";

export const ShowSuccessToast = (message) => {
  Toast.show({
    type: "success",
    text1: message,
    swipeable: true
  });
};

export const ShowErrorToast = (message) => {
  Toast.show({
    type: "error",
    text1: message,
    swipeable: true
  });
};

export const GetServerImage = (path) => {
  return `${APP_IMAGE_BASE_URL}/${path}`
}
