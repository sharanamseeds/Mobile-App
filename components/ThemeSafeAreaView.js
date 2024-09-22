import { SafeAreaView } from "react-native-safe-area-context";
import CommonStyle from "../constant/CommonStyle";
import { ScrollView, StatusBar, useColorScheme } from "react-native";
import { useThemeColor } from "../hook/useThemeColor";

const ThemeSafeAreaView = ({ children, style }) => {
  const bgColor = useThemeColor({}, "background");
  const theme = useColorScheme()

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={{ flex: 1, backgroundColor: bgColor, ...style }}>
        <StatusBar backgroundColor={bgColor} barStyle={theme === "dark" ? "light-content" : "dark-content"}/>
        <SafeAreaView
          style={{ ...CommonStyle.container, backgroundColor: bgColor }}
        >
          {children}
        </SafeAreaView>
      </ScrollView>
    </>
  );
};

export default ThemeSafeAreaView;
