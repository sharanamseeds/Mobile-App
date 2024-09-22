// CustomDrawerContent.js
import React from "react";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { View, Text, Image, StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";

export default function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.profileContainer}>
        <Image
          source={{
            uri: "https://res.cloudinary.com/dztl85wyk/image/upload/v1717309940/my-folder/mp991c5rfb6wzyast4wh.png",
          }} // Replace with your profile image URL
          style={styles.profileImage}
        />
        <View>
          <ThemedText style={styles.profileName}>John Doe</ThemedText>
        </View>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  profileContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileName: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
  },
});
