import { SafeAreaView } from "react-native-safe-area-context";
import CommonStyle from "../constant/CommonStyle";
import { StatusBar, useColorScheme } from "react-native";
import { useThemeColor } from "../hook/useThemeColor";

const ThemeSafeAreaViewWOS = ({ children, style }) => {
  const bgColor = useThemeColor({}, "background");
  const theme = useColorScheme();

  return (
    <>
      <StatusBar
        backgroundColor={bgColor}
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />
      <SafeAreaView
        style={{
          ...CommonStyle.container,
          flex: 1,
          backgroundColor: bgColor,
          ...style,
        }}
      >
        {children}
      </SafeAreaView>
    </>
  );
};

export default ThemeSafeAreaViewWOS;
