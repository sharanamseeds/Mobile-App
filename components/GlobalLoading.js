import React from "react";
import { ActivityIndicator, StatusBar, StyleSheet, useColorScheme, View } from "react-native";
import { useThemeColor } from "../hook/useThemeColor";

const GlobalLoader = () => {
  const bgColor = useThemeColor({}, "background");
  const theme = useColorScheme()
  const primaryColor = useThemeColor({}, "primary");
  return (
    <>
      <StatusBar
        backgroundColor={bgColor}
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />
      <View
        style={{
          flex: 1,
          backgroundColor: bgColor,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size={45} color={primaryColor} />
      </View>
    </>
  );
};

// const styles = StyleSheet.create({
//   container: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0, 0, 0, 0.8)", // Semi-transparent background
//     zIndex: 1000, // Ensure it's on top of everything
//   },
//   loader: {
//     width: 100,
//     height: 100,
//   },
// });

export default GlobalLoader;
