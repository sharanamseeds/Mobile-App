import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ThemeSafeAreaView from "../../components/ThemeSafeAreaView";
import { ThemedView } from "../../components/ThemedView";
import { Feather } from "@expo/vector-icons";
import { useThemeColor } from "../../hook/useThemeColor";
import { ThemedText } from "../../components/ThemedText";
import { AuthContext } from "../../context/authContext";
import { useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GetServerImage, ShowSuccessToast } from "../../helper/helper";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { UPDATEUSER } from "../../constant/ApiRoutes";
import i18n from "../../i18n";

const User = ({ navigation }) => {
  const textColor = useThemeColor({}, "text");
  const lightColor = useThemeColor({}, "lightColor");
  const darkColor = useThemeColor({}, "darkColor");
  const primaryColor = useThemeColor({}, "primary");
  const background = useThemeColor({ light: lightColor, dark: darkColor }, "background");
  const { signOut } = useContext(AuthContext);
  const [image, setImage] = useState("");
  const [userDetail, setUserDetail] = useState({});

  const getUserDetail = async () => {
    const userData = (await AsyncStorage.getItem("user_data"))
      ? JSON.parse(await AsyncStorage.getItem("user_data"))
      : {};
    try {
      const response = await axios.get(`${UPDATEUSER}/${userData?._id}?lang_code=${i18n.locale}`);
      setUserDetail(response.data?.payload?.result);
    } catch (error) {
      console.log(error, "error");
    }
  };

  const uploadImage = async () => {
    // Request permission to access the gallery
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    // Open image picker
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result?.assets?.[0]?.uri);
      updateProfileImage(result?.assets?.[0]?.uri);
    }
  };

  const updateProfileImage = async (imageUri) => {
    try {
      let formData = new FormData();

      // Get the file name and type from the image URI
      const filename = imageUri.split("/").pop(); // Extract the file name
      const fileType = filename.split(".").pop(); // Extract the file extension (type)

      // Append the image file to the FormData object
      formData.append("profile", {
        uri: imageUri, // URI of the image
        name: filename, // File name
        type: `image/${fileType}`, // Mime type (like 'image/jpeg', 'image/png')
      });

      const response = await axios.put(`${UPDATEUSER}/${userDetail?._id}?lang_code=${i18n.locale}`, formData);
      if (response.data) {
        ShowSuccessToast(response.data?.message);
      }
    } catch (error) {
      console.log(error?.response?.data?.message);
      console.log(error, "error");
    }
  };

  const reloadData = () => {
    getUserDetail();
    navigation.setOptions({
      title: i18n.t('profile'),
    });
  }

  useEffect(() => {
    getUserDetail();
    navigation.setOptions({
      title: i18n.t('profile'),
    });
  }, [i18n.locale]);

  return (
    <ThemeSafeAreaView onReload={reloadData}>
      <ThemedView>
        <View style={styles.imageBox}>
          <View style={{ position: "relative" }}>
            <Image
              style={styles.image}
              source={{
                uri: image ? image : userDetail?.profile ? GetServerImage(userDetail?.profile) : "https://res.cloudinary.com/dztl85wyk/image/upload/v1717309940/my-folder/nzxf1mgeqfrulryziwln.png",
              }}
              width={100}
              height={100}
            />
            <TouchableOpacity
              style={{ position: "absolute", bottom: 0, right: 0 }}
              onPress={() => uploadImage()}
            >
              <Feather
                style={{ ...styles.editButton, backgroundColor: background }}
                name="edit"
                size={22}
                color={primaryColor}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View>
          <ThemedText
            style={{
              fontWeight: 600,
              fontSize: 22,
              textAlign: "center",
              fontFamily: "Poppins",
              marginTop: 10,
            }}
          >
            {userDetail?.agro_name}
          </ThemedText>
          <Text style={{ ...styles.price, textAlign: "center", fontFamily: "Poppins" }}>
            {userDetail?.email}
          </Text>
        </View>
        <View style={{ paddingHorizontal: 15, marginTop: 25 }}>
          <TouchableOpacity
            style={styles.moduleBox}
            onPress={() => {
              navigation.navigate("Account");
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ marginRight: 10 }}>
                <Feather name="user" color={textColor} size={24} />
              </View>
              <View>
                <ThemedText style={{ fontSize: 18 }}>{i18n.t("my_account")}</ThemedText>
                <Text style={{ ...styles.price, fontFamily: "Poppins" }}>
                  {i18n.t("active_user")}
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={25} color={"gray"} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.moduleBox}
            onPress={() => {
              navigation.navigate("Cart");
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ marginRight: 10 }}>
                <Feather name="shopping-cart" color={textColor} size={24} />
              </View>
              <View>
                <ThemedText style={{ fontSize: 18 }}>{i18n.t("my_cart")}</ThemedText>
                <Text style={{ ...styles.price, fontFamily: "Poppins" }}>
                  {i18n.t("item_in_cart")}
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={25} color={"gray"} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.moduleBox}
            onPress={() => {
              navigation.navigate("Order");
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ marginRight: 10 }}>
                <Feather name="archive" color={textColor} size={24} />
              </View>
              <View>
                <ThemedText style={{ fontSize: 18 }}>{i18n.t("my_order")}</ThemedText>
                <Text style={{ ...styles.price, fontFamily: "Poppins" }}>{i18n.t("orders")}</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={25} color={"gray"} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.moduleBox}
            onPress={() => {
              navigation.navigate("ChangePassword");
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ marginRight: 10 }}>
                <Feather name="key" color={textColor} size={24} />
              </View>
              <View>
                <ThemedText style={{ fontSize: 18 }}>{i18n.t("change_password")}</ThemedText>
                <Text style={{ ...styles.price, fontFamily: "Poppins" }}>
                  {i18n.t("update_password")}
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={25} color={"gray"} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.moduleBox} onPress={() => signOut()}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ marginRight: 10 }}>
                <Feather name="log-out" color={textColor} size={24} />
              </View>
              <View>
                <ThemedText style={{ fontSize: 18 }}>{i18n.t("logout")}</ThemedText>
                <Text style={{ ...styles.price, fontFamily: "Poppins" }}>
                  {i18n.t("logout_from_app")}
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={25} color={"gray"} />
          </TouchableOpacity>
        </View>
      </ThemedView>
    </ThemeSafeAreaView>
  );
};

export default User;

const styles = StyleSheet.create({
  imageBox: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
  },
  image: {
    borderRadius: 50,
  },
  editButton: {
    width: 33,
    borderRadius: 50,
    padding: 5,
  },
  price: {
    fontSize: 12,
    color: "gray",
  },
  moduleBox: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomColor: "gray",
    borderBottomWidth: 0.5,
  },
});
