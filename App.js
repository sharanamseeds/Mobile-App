import { AuthContext, AuthProvider } from "./context/authContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-gesture-handler";
import "react-native-reanimated";
import Navbar from "./navigation";
import { Provider } from "react-redux";
import store from "./redux/store";
import { useFonts } from "expo-font";
import { Entypo, Feather, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from 'react-native-toast-message';
import './config/axios'

// npx expo install --fix
//eas build -p android --profile preview

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins: require("./assets/fonts/Poppins/Poppins-Regular.ttf"),
    PoppinsBold: require("./assets/fonts/Poppins/Poppins-Bold.ttf"),
    ...FontAwesome.font,
    ...Feather.font,
    ...Entypo.font,
    ...MaterialCommunityIcons.font
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }
  return (
    <Provider store={store}>
      <AuthProvider>
        <SafeAreaProvider>
          <Navbar />
          <Toast />
        </SafeAreaProvider>
      </AuthProvider>
    </Provider>
  );
}
