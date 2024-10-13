import { SafeAreaView } from "react-native-safe-area-context";
import CommonStyle from "../constant/CommonStyle";
import { RefreshControl, ScrollView, StatusBar, useColorScheme } from "react-native";
import { useThemeColor } from "../hook/useThemeColor";
import { useState } from "react";

const ThemeSafeAreaView = ({ children, style, onReload, isReloadable = true }) => {
  const bgColor = useThemeColor({}, "background");
  const theme = useColorScheme()
  const [refreshing, setRefreshing] = useState(false);

  const callRefresh = () => {
    setRefreshing(true)
    onReload()
    setRefreshing(false)
  }

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={{ flex: 1, backgroundColor: bgColor, ...style }} refreshControl={isReloadable && <RefreshControl refreshing={refreshing} onRefresh={callRefresh} />}>
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
