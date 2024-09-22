import React from "react";
import { View, Image, StyleSheet } from "react-native";

const SplashScreen = () => {
  return (
    <>
      <View style={styles.container}>
        <Image source={require("../assets/logo_full.png")} style={styles.image} />
      </View>
    </>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFF",
    alignItems: "center",
    justifyContent: "center", // Center the image vertically as well
    flex: 1,
    flexDirection: "column", // Default is column; this line can be omitted
  },
  image: {
    width: "100%", // Makes the image take full width of the parent container
    resizeMode: "contain", // Keeps the aspect ratio of the image
  },
});
