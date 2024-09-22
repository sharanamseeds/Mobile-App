import React from "react";
import { Image, StyleSheet, View } from "react-native";

const GlobalLoader = ({ visible }) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Image
        style={styles.loader}
        source={require("../assets/images/loading2.gif")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
    zIndex: 1000, // Ensure it's on top of everything
  },
  loader: {
    width: 100,
    height: 100,
  },
});

export default GlobalLoader;