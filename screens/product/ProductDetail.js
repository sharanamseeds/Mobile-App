import {
  Text,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Modal,
  Dimensions,
} from "react-native";
import ThemeSafeAreaView from "../../components/ThemeSafeAreaView";
import { ThemedView } from "../../components/ThemedView";
import { useThemeColor } from "../../hook/useThemeColor";
import { ThemedText } from "../../components/ThemedText";
import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ADDCART, DEC, DELITEM, INC } from "../../redux/cart/CartSlice";
import { Entypo, Feather } from "@expo/vector-icons";
import CartItemTotal from "../../components/CartItemTotal";
import axios from "axios";
import { PRODUCTDETAIL } from "../../constant/ApiRoutes";
import HTMLView from "react-native-htmlview";
import { GetServerImage } from "../../helper/helper";
import { AuthContext } from "../../context/authContext";
import i18n from "../../i18n";
import Carousel from "react-native-reanimated-carousel";

const ProductDetail = ({ navigation, route }) => {
  // theme color
  const { pid } = route.params;
  const width = Dimensions.get("window").width;
  const { cartItem } = useSelector((state) => state?.cartItem);
  const dispatch = useDispatch();
  const [productDetail, setProductDetail] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState("");
  const primaryColor = useThemeColor({}, "primary");
  const textColor = useThemeColor({}, "text");
  const boxColor = useThemeColor({}, "boxColor");
  const boxShadow = useThemeColor({}, "boxShadow");
  const { showLoader, hideLoader } = useContext(AuthContext);

  const getProductDetail = async (id) => {
    try {
      showLoader();
      const productDoc = await axios.get(`${PRODUCTDETAIL}/${id}?lang_code=${i18n.locale}`);
      setProductDetail(productDoc?.data?.payload?.result?.product);
      setSelectedOffer(productDoc?.data?.payload?.result?.product?.offers?.[0]?._id);
      hideLoader();
    } catch (error) {
      hideLoader();
      console.log(error, "error");
    }
  };

  const cartData = cartItem.find((f) => f._id === pid);

  useEffect(() => {
    if (pid) {
      getProductDetail(pid);
    }
    navigation.setOptions({
      title: i18n.t("product_detail"),
    });
  }, [pid, i18n.locale]);

  return (
    <>
      <ThemeSafeAreaView>
        <ThemedView
          style={{
            borderBottomColor: "grey",
            borderBottomWidth: 2,
            paddingBottom: 15,
          }}
        >
          {/* <View style={styles.imageCard}>
            <Image
              source={{
                uri: GetServerImage(productDetail?.images?.[0]),
              }}
              width={125}
              height={130}
            />
          </View> */}
          <Carousel
            loop
            mode="parallax"
            width={width}
            height={180}
            autoPlay={true}
            data={productDetail?.images}
            autoPlayInterval={2000}
            scrollAnimationDuration={1000}
            renderItem={({ item, index }) => (
              <View style={styles.imageCard} key={index}>
                <Image
                  style={{borderRadius: 20}}
                  source={{
                    uri: GetServerImage(item),
                  }}
                  width={155}
                  height={180}
                />
              </View>
            )}
          />
          <View style={{ ...styles.companyDetail, paddingHorizontal: 15 }}>
            <ThemedText style={{ ...styles.price, marginTop: -2 }}>
              {productDetail?.product_code}
            </ThemedText>
            <ThemedText style={{ fontSize: 18, fontWeight: 600 }}>
              {productDetail?.product_name}
            </ThemedText>
          </View>
        </ThemedView>
        <ThemedView
          style={{
            paddingHorizontal: 15,
            borderTopColor: "grey",
            borderTopWidth: 2,
            paddingTop: 15,
            marginTop: 1,
          }}
        >
          {productDetail?.offers?.length > 0 && (
            <TouchableOpacity
              style={{ ...styles.offerCard, backgroundColor: `${primaryColor}80` }}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <View style={{ ...styles.offerDetail }}>
                <Entypo name="price-tag" size={24} color={textColor} />
                <View>
                  <ThemedText style={{ marginLeft: 5 }}>
                    {productDetail?.offers?.[0]?.offer_name}
                  </ThemedText>
                  <ThemedText style={{ fontSize: 12, marginLeft: 5, marginTop: -4 }}>
                    {productDetail?.offers?.[0]?.offer_code} (
                    {productDetail?.offers?.[0]?.percentage_discount}
                    {productDetail?.offers?.[0]?.offer_type === "percentage" ? "% off" : "off"})
                  </ThemedText>
                </View>
              </View>
              <View
                style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}
              >
                <ThemedText>{i18n.t("view_offer")}</ThemedText>
                <Feather name="chevron-right" size={18} color={textColor} />
              </View>
            </TouchableOpacity>
          )}
          <View style={styles.priceCard}>
            <View>
              <ThemedText style={{ fontWeight: 600, fontSize: 18, color: "#000" }}>
                ₹ {productDetail?.price}
              </ThemedText>
              <ThemedText style={{ fontWeight: 400, fontSize: 14, marginTop: 5, color: "#000" }}>
                @{productDetail?.price}
              </ThemedText>
            </View>
            {productDetail?.in_stock ? (
              !cartData ? (
                <TouchableOpacity
                  style={{
                    width: "40%",
                    height: "80%",
                    backgroundColor: primaryColor,
                    textAlign: "center",
                    borderRadius: 10,
                    marginLeft: 10,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  disabled={cartData?.quantity === cartData?.qty}
                  onPress={() =>
                    dispatch(ADDCART({ ...productDetail, selectedOffer: selectedOffer, qty: 1 }))
                  }
                >
                  <Text
                    style={{
                      textAlign: "center",
                      color: "#FFF",
                      fontSize: 14,
                      fontWeight: 600,
                      fontFamily: "Poppins",
                    }}
                  >
                    {i18n.t("add")}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={{ ...styles.cartButtonMain, borderColor: primaryColor }}>
                  <TouchableOpacity
                    style={{
                      ...styles.cartButton,
                      backgroundColor: primaryColor,
                      borderTopLeftRadius: 10,
                      borderBottomLeftRadius: 10,
                      marginLeft: -1,
                    }}
                    onPress={() =>
                      cartData?.qty === 1
                        ? dispatch(DELITEM(productDetail))
                        : dispatch(DEC(productDetail))
                    }
                  >
                    <Feather
                      name={cartData?.qty === 1 ? "trash-2" : "minus"}
                      size={24}
                      color={"#FFF"}
                    />
                  </TouchableOpacity>
                  <Text style={{ backgroundColor: "#FFF", fontSize: 20 }}>{cartData?.qty}</Text>
                  <TouchableOpacity
                    style={{
                      ...styles.cartButton,
                      backgroundColor: primaryColor,
                      borderTopRightRadius: 10,
                      borderBottomRightRadius: 10,
                      marginRight: -1,
                    }}
                    disabled={cartData?.quantity === cartData?.qty}
                    onPress={() => dispatch(INC(productDetail))}
                  >
                    <Feather name="plus" size={24} color={"#FFF"} />
                  </TouchableOpacity>
                </View>
              )
            ) : (
              <Text style={{ color: "#FF3838" }}>{i18n.t("out_of_stock")}</Text>
            )}
          </View>
          {productDetail?.description && (
            <View style={{ marginTop: 10 }}>
              <ThemedText style={{ fontSize: 16, fontWeight: 600 }}>
                {i18n.t("description")}
              </ThemedText>
              <View style={styles.ul}>
                <View style={styles.li}>
                  <ThemedText style={{ ...styles.bullet }}>-</ThemedText>
                  <HTMLView
                    value={`<body>${productDetail?.description || ""}</body>`}
                    stylesheet={{ body: { color: textColor } }}
                  />
                </View>
              </View>
            </View>
          )}
        </ThemedView>
      </ThemeSafeAreaView>
      <CartItemTotal navigation={navigation} />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View
            style={{
              ...styles.modalView,
              backgroundColor: boxColor,
              shadowColor: boxShadow,
              height: "auto",
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: textColor, fontSize: 20, fontWeight: 600 }}>Offers</Text>
              <Feather
                name="x"
                size={22}
                style={{ marginTop: 8 }}
                color={textColor}
                onPress={() => setModalVisible(!modalVisible)}
              />
            </View>
            <View style={{ marginTop: 15 }}>
              {productDetail?.offers?.length > 0 &&
                productDetail?.offers.map((item, index) => (
                  <TouchableOpacity
                    style={{ flexDirection: "row" }}
                    onPress={() => {
                      setSelectedOffer(item?._id);
                      setModalVisible(false);
                    }}
                    key={index}
                  >
                    <View
                      style={{
                        ...styles.radio,
                        borderRadius: 50,
                        borderColor: primaryColor,
                        backgroundColor: selectedOffer === item?._id ? primaryColor : "transparent",
                        marginRight: 10,
                        marginBottom: 15,
                      }}
                    ></View>
                    <ThemedText>
                      {item?.offer_name} ({item?.percentage_discount}
                      {item?.offer_type === "percentage" ? "% off" : "off"})
                    </ThemedText>
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ProductDetail;

const styles = StyleSheet.create({
  imageCard: {
    height: 150,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  price: {
    fontSize: 14,
    color: "gray",
  },
  pill: {
    backgroundColor: "#dceeeb",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 50,
    marginTop: 10,
    width: "21%",
    fontWeight: 500,
    fontSize: 14,
  },
  textBox: {
    width: "25%",
    paddingHorizontal: 5,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    textAlign: "center",
    backgroundColor: "#d1f2e9fa",
  },
  priceCard: {
    backgroundColor: "#dceeeb",
    padding: 8,
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    borderRadius: 10,
    alignItems: "center",
    textAlign: "center",
  },
  ul: {
    marginTop: 5,
  },
  li: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  bullet: {
    fontSize: 20,
    lineHeight: 22,
    marginRight: 10,
  },
  liText: {
    flex: 1, // Ensures the text takes the remaining space
    fontSize: 16,
  },
  cartButtonMain: {
    width: "40%",
    height: "80%",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderRadius: 10,
    marginLeft: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cartButton: {
    height: "100%",
    width: "30%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  offerCard: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 10,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  offerDetail: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  modalView: {
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 20,
    bottom: 0,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    height: "60%",
  },
  centeredView: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  radio: {
    height: 20,
    width: 20,
    borderRadius: 50,
    borderWidth: 1,
  },
  loader: {
    marginVertical: 16,
    alignItems: "center",
  },
});
