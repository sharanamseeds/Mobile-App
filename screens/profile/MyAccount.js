import { Image, StyleSheet, Text, View } from "react-native";
import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";
import ThemeSafeAreaView from "../../components/ThemeSafeAreaView";
import { useThemeColor } from "../../hook/useThemeColor";
import { Feather } from "@expo/vector-icons";
import ButtonPrimary from "../../components/ButtonPrimary";
import { useContext, useEffect, useState } from "react";
import { GetServerImage, ShowSuccessToast } from "../../helper/helper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UPDATEUSER } from "../../constant/ApiRoutes";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { TouchableOpacity } from "react-native";
import { AuthContext } from "../../context/authContext";
import i18n from "../../i18n";

const MyAccount = ({ navigation }) => {
  const textColor = useThemeColor({}, "text");
  const lightColor = useThemeColor({}, "lightColor");
  const darkColor = useThemeColor({}, "darkColor");
  const primaryColor = useThemeColor({}, "primary");
  const background = useThemeColor({ light: lightColor, dark: darkColor }, "background");
  const { showLoader, hideLoader } = useContext(AuthContext);
  const [userDetail, setUserDetail] = useState({});

  const getUserDetail = async () => {
    showLoader();
    const userData = (await AsyncStorage.getItem("user_data"))
      ? JSON.parse(await AsyncStorage.getItem("user_data"))
      : {};
    try {
      const response = await axios.get(`${UPDATEUSER}/${userData?._id}?lang_code=${i18n.locale}`);
      setUserDetail(response.data?.payload?.result);
      hideLoader();
    } catch (error) {
      hideLoader();
      console.log(error, "error");
    }
  };

  const uploadImage = async (name) => {
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
      updateProfileImage(result?.assets?.[0]?.uri, name);
    }
  };

  const updateProfileImage = async (imageUri, keyName) => {
    try {
      let formData = new FormData();

      // Get the file name and type from the image URI
      const filename = imageUri.split("/").pop(); // Extract the file name
      const fileType = filename.split(".").pop(); // Extract the file extension (type)

      // Append the image file to the FormData object
      formData.append(keyName, {
        uri: imageUri, // URI of the image
        name: filename, // File name
        type: `image/${fileType}`, // Mime type (like 'image/jpeg', 'image/png')
      });

      const response = await axios.put(`${UPDATEUSER}/${userDetail?._id}?lang_code=${i18n.locale}`, formData);
      if (response.data) {
        ShowSuccessToast(response.data?.message);
        getUserDetail();
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  useEffect(() => {
    getUserDetail();
  }, []);

  return (
    <ThemeSafeAreaView style={{ paddingHorizontal: 15 }}>
      <ThemedView style={{ marginTop: 20 }}>
        <View style={styles.imageBox}>
          <View style={{ position: "relative" }}>
            <Image
              style={styles.image}
              source={{
                uri: userDetail?.profile
                  ? GetServerImage(userDetail?.profile)
                  : "https://res.cloudinary.com/dztl85wyk/image/upload/v1717309940/my-folder/nzxf1mgeqfrulryziwln.png",
              }}
              width={100}
              height={100}
            />

            <TouchableOpacity
              style={{ position: "absolute", bottom: 0, right: 0 }}
              onPress={() => uploadImage("profile")}
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
        <View style={{ marginTop: 30 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <ThemedText style={{ fontSize: 22, fontWeight: 600 }}>
              {i18n.t("personal_detail")}
            </ThemedText>
            <TouchableOpacity
              style={{ flexDirection: "row" }}
              onPress={() => navigation.navigate("EditProfile")}
            >
              <Feather
                style={{ backgroundColor: background }}
                name="edit"
                size={22}
                color={primaryColor}
              />
              <ThemedText style={{ color: primaryColor, marginLeft: 5 }}>
                {i18n.t("edit_profile")}
              </ThemedText>
            </TouchableOpacity>
          </View>
          <ThemedText style={{ color: "gray", marginTop: 12 }}>{i18n.t("full_name")}</ThemedText>
          <ThemedText>{userDetail?.name}</ThemedText>
          <ThemedText style={{ color: "gray", marginTop: 12 }}>{i18n.t("firm_name")}</ThemedText>
          <ThemedText>{userDetail?.agro_name}</ThemedText>
          <ThemedText style={{ color: "gray", marginTop: 12 }}>{i18n.t("phone")}</ThemedText>
          <ThemedText>{userDetail?.contact_number}</ThemedText>
          <ThemedText style={{ color: "gray", marginTop: 12 }}>{i18n.t("email")}</ThemedText>
          <ThemedText>{userDetail?.email}</ThemedText>
          <ThemedText style={{ color: "gray", marginTop: 12 }}>{i18n.t("gst")}</ThemedText>
          <ThemedText>{userDetail?.gst_number}</ThemedText>
          <ThemedText style={{ color: "gray", marginTop: 12 }}>
            {i18n.t("billing_address")}
          </ThemedText>
          <ThemedText>{`${userDetail?.billing_address?.address_line || ""} ${
            userDetail?.billing_address?.city || ""
          } ${userDetail?.billing_address?.state || ""} ${
            userDetail?.billing_address?.pincode || ""
          }`}</ThemedText>
          <ThemedText style={{ color: "gray", marginTop: 12 }}>
            {i18n.t("shipping_address")}
          </ThemedText>
          <ThemedText>{`${userDetail?.shipping_address?.address_line || ""} ${
            userDetail?.shipping_address?.city || ""
          } ${userDetail?.shipping_address?.state || ""} ${
            userDetail?.shipping_address?.pincode || ""
          }`}</ThemedText>
        </View>
        <View style={{ marginTop: 30, marginBottom: 15 }}>
          <ThemedText style={{ fontSize: 22, fontWeight: 600, marginBottom: 20 }}>
            {i18n.t("document_pending")}
          </ThemedText>
          {!userDetail?.aadhar_card && (
            <TouchableOpacity
              style={{
                padding: 10,
                borderWidth: 1,
                borderColor: textColor,
                borderRadius: 10,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
              onPress={() => uploadImage("aadhar_card")}
            >
              <ThemedText>{i18n.t("address_proof")}</ThemedText>
              <View
                style={{
                  backgroundColor: "rgba(233, 70, 44, 0.75)",
                  paddingVertical: 2,
                  paddingHorizontal: 8,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: "#FFF" }}>Pending</Text>
              </View>
            </TouchableOpacity>
          )}
          {!userDetail?.other_document && (
            <TouchableOpacity
              style={{
                padding: 10,
                borderWidth: 1,
                borderColor: textColor,
                borderRadius: 10,
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 10,
              }}
              onPress={() => uploadImage("other_document")}
            >
              <ThemedText>{i18n.t("pan")}</ThemedText>
              <View
                style={{
                  backgroundColor: "rgba(233, 70, 44, 0.75)",
                  paddingVertical: 2,
                  paddingHorizontal: 8,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: "#FFF" }}>Pending</Text>
              </View>
            </TouchableOpacity>
          )}
          {!userDetail?.bank_details && (
            <TouchableOpacity
              style={{
                padding: 10,
                borderWidth: 1,
                borderColor: textColor,
                borderRadius: 10,
                flexDirection: "row",
                justifyContent: "space-between",
                marginVertical: 10,
              }}
              onPress={() => uploadImage("bank_details")}
            >
              <ThemedText>{i18n.t("passbook")}</ThemedText>
              <View
                style={{
                  backgroundColor: "rgba(233, 70, 44, 0.75)",
                  paddingVertical: 2,
                  paddingHorizontal: 8,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: "#FFF" }}>Pending</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
        {/* <ButtonPrimary
          title={"Upload Pending Document"}
          style={{ marginTop: 10, marginBottom: 20, padding: 10 }}
          handlePress={() => console.log("call")}
        /> */}
      </ThemedView>
    </ThemeSafeAreaView>
  );
};

export default MyAccount;

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
