import { useDispatch, useSelector } from "react-redux";
import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";
import ThemeSafeAreaView from "../../components/ThemeSafeAreaView";
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Entypo, Feather } from "@expo/vector-icons";
import { useThemeColor } from "../../hook/useThemeColor";
import { INC, DEC, DELITEM, REMOVECARTITEM } from "../../redux/cart/CartSlice";
import { GetServerImage, ShowSuccessToast } from "../../helper/helper";
import { useEffect, useState } from "react";
import { CALCULATEBILL, ORDER } from "../../constant/ApiRoutes";
import axios from "axios";
import ButtonPrimary from "../../components/ButtonPrimary";
import i18n from "../../i18n";

const MyCart = ({ navigation }) => {
  const dispatch = useDispatch();
  const screenHeight = Dimensions.get("window").height;
  const [billingAmount, setBillingAmount] = useState({});
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState({})
  const { cartItem } = useSelector((state) => state?.cartItem);

  // theme color
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "primary");
  const boxColor = useThemeColor({}, "boxColor");
  const boxShadow = useThemeColor({}, "boxShadow");

  const getProductTotal = async () => {
    try {
      let Product = [];
      if (cartItem?.length > 0) {
        cartItem.map((p) =>
          Product.push({
            product_id: p?._id,
            offer_id: p?.selectedOffer || p?.offers?.[0]?._id,
            quantity: p?.qty,
          })
        );
      }
      const productParams = JSON.stringify({ products: Product });
      const result = await axios.post(`${CALCULATEBILL}?payload=${productParams}&lang_code=${i18n.locale}`);
      if (result?.data?.payload?.result) {
        setBillingAmount(result?.data?.payload?.result);
      }
    } catch (error) {
      console.log(error, "error");
      console.log(error?.response?.data, "error");
    }
  };

  const orderNow = async () => {
    try {
      let Product = [];
      if (cartItem?.length > 0) {
        cartItem.map((p) =>
          Product.push({
            product_id: p?._id,
            offer_id: p?.selectedOffer || p?.offers?.[0]?._id,
            quantity: p?.qty,
          })
        );
      }
      const productParams = JSON.stringify({ products: Product });
      const result = await axios.post(`${ORDER}?payload=${productParams}&lang_code=${i18n.locale}`);
      if (result?.data) {
        setOrderSuccess(true);
        setTimeout(() => {
          setOrderSuccess(false);
          dispatch(REMOVECARTITEM());
          navigation.navigate("Product");
        }, 4500);
      }
    } catch (error) {
      setOrderSuccess(false);
      console.log(error, "error");
      console.log(error?.response?.data, "error");
    }
  };

  useEffect(() => {
    if (cartItem?.length > 0) {
      getProductTotal();
    }
  }, [cartItem]);

  return (
    <>
      <ThemeSafeAreaView style={{ paddingHorizontal: 15 }}>
        <ThemedView style={{ marginTop: 20, height: screenHeight - 65 }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {cartItem && cartItem?.length > 0 ? (
              cartItem.map((item, index) => (
                <ThemedView
                  style={{
                    ...styles.carContainer,
                    backgroundColor: boxColor,
                    shadowColor: boxShadow,
                  }}
                  key={index}
                >
                  <View style={{ ...styles.card }}>
                    <View style={styles.cardImage}>
                      <TouchableOpacity
                        onPress={() => navigation.navigate("ProductDetail", { pid: item._id })}
                      >
                        <Image
                          source={{
                            uri: GetServerImage(item?.images?.[0]),
                          }}
                          style={styles.image}
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.cardDetail}>
                      <View style={styles.textContainer}>
                        <TouchableOpacity
                          onPress={() => navigation.navigate("ProductDetail", { pid: item._id })}
                        >
                          <ThemedText style={{ ...styles.title }}>{item?.product_name}</ThemedText>
                          <ThemedText style={{ ...styles.price, marginTop: -2 }}>
                            {item?.product_code}
                          </ThemedText>
                          <ThemedText style={{ ...styles.title }}>
                            ₹ {item?.price?.toFixed(2)}
                          </ThemedText>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={{ flex: 1, alignItems: "flex-end" }}>
                      <View style={styles.cardButton}>
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
                              item?.qty === 1 ? dispatch(DELITEM(item)) : dispatch(DEC(item))
                            }
                          >
                            <Feather
                              name={item?.qty === 1 ? "trash-2" : "minus"}
                              size={24}
                              color={"#FFF"}
                            />
                          </TouchableOpacity>
                          <Text style={{ backgroundColor: "#FFF", fontSize: 18 }}>{item?.qty}</Text>
                          <TouchableOpacity
                            style={{
                              ...styles.cartButton,
                              backgroundColor: primaryColor,
                              borderTopRightRadius: 10,
                              borderBottomRightRadius: 10,
                              marginRight: -1,
                            }}
                            disabled={item?.quantity === item?.qty}
                            onPress={() => dispatch(INC(item))}
                          >
                            <Feather name="plus" size={24} color={"#FFF"} />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
                        <ThemedText style={{ color: "gray", fontSize: 12 }}>{i18n.t('item_total')}:</ThemedText>
                        <ThemedText style={{ fontSize: 12, marginLeft: 5 }}>
                          ₹ {billingAmount?.products?.[index]?.purchase_price?.toFixed(2) || 0}
                        </ThemedText>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                          marginTop: -4,
                        }}
                      >
                        <ThemedText style={{ color: "gray", fontSize: 12 }}>{i18n.t('tax')}:</ThemedText>
                        <ThemedText style={{ fontSize: 12, marginLeft: 5 }}>
                          ₹ {billingAmount?.products?.[index]?.gst_amount?.toFixed(2) || 0}
                        </ThemedText>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                          marginTop: -4,
                        }}
                      >
                        <ThemedText style={{ color: "gray", fontSize: 12 }}>{i18n.t('discount')}:</ThemedText>
                        <ThemedText style={{ fontSize: 12, marginLeft: 5 }}>
                          - ₹ {billingAmount?.products?.[index]?.offer_discount?.toFixed(2) || 0}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={{
                      ...styles.offerCard,
                      backgroundColor: `${primaryColor}80`,
                      marginTop: -8,
                      marginHorizontal: 5,
                    }}
                    onPress={() => {
                      setSelectedProduct(item)
                      setModalVisible(true)
                    }}
                  >
                    <View style={{ ...styles.offerDetail }}>
                      <Entypo name="price-tag" size={24} color={textColor} />
                      <ThemedText style={{ marginLeft: 5 }}>
                        {item?.offers?.[0]?.offer_name}
                      </ThemedText>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ThemedText>View Offer</ThemedText>
                      <Feather name="chevron-right" size={18} color={textColor} />
                    </View>
                  </TouchableOpacity>
                  
                  <View
                    style={{ borderBottomWidth: 0.5, borderBottomColor: "gray", padding: 5 }}
                  ></View>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: 8,
                    }}
                    onPress={() => dispatch(DELITEM(item))}
                  >
                    <Feather name="trash-2" size={20} color={textColor} />
                    <ThemedText style={{ marginLeft: 5 }}>{i18n.t('remove_item')}</ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              ))
            ) : (
              <View
                style={{
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: screenHeight - 250,
                }}
              >
                <Image
                  source={require("../../assets/images/shopping-bag_5006896.png")}
                  style={{ width: 100, height: 100 }}
                />
                <ThemedText type="title" style={{ fontSize: 22 }}>
                  {i18n.t('cart_not_found')}
                </ThemedText>
              </View>
            )}
            {cartItem && cartItem?.length > 0 && (
              <ThemedView
                style={{
                  ...styles.carContainer,
                  backgroundColor: boxColor,
                  shadowColor: boxShadow,
                  marginTop: 20,
                  marginBottom: 95,
                }}
              >
                <View style={{ ...styles.card }}>
                  <View style={styles.cardDetail}>
                    <View style={styles.textContainer}>
                      <ThemedText style={{ fontSize: 20, fontWeight: 600, marginBottom: 10 }}>
                        {i18n.t('order_detail')}
                      </ThemedText>
                      <View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                          <ThemedText style={{ ...styles.price, fontSize: 16 }}>
                            {i18n.t('sub_total')}
                          </ThemedText>
                          <ThemedText>₹ {billingAmount?.order_amount?.toFixed(2)}</ThemedText>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                          <ThemedText style={{ ...styles.price, fontSize: 16 }}>{i18n.t('gst')}</ThemedText>
                          <ThemedText>₹ {billingAmount?.tax_amount?.toFixed(2)}</ThemedText>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                          <ThemedText style={{ ...styles.price, fontSize: 16 }}>
                          {i18n.t('discount')}
                          </ThemedText>
                          <ThemedText>- ₹ {billingAmount?.discount_amount?.toFixed(2)}</ThemedText>
                        </View>
                      </View>
                      <View
                        style={{
                          borderBottomWidth: 1,
                          borderBottomColor: "gray",
                          borderStyle: "dashed",
                          padding: 5,
                        }}
                      ></View>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          marginTop: 10,
                        }}
                      >
                        <ThemedText style={{ fontSize: 16 }}>{i18n.t('payment_amount')}</ThemedText>
                        <ThemedText>₹ {billingAmount?.billing_amount?.toFixed(2)}</ThemedText>
                      </View>
                    </View>
                  </View>
                </View>
              </ThemedView>
            )}
          </ScrollView>
        </ThemedView>
        {cartItem?.length > 0 && (
          <ButtonPrimary
            title={i18n.t('order_now')}
            style={{ position: "absolute", bottom: 10, width: "100%" }}
            handlePress={orderNow}
          />
        )}
      </ThemeSafeAreaView>
      {orderSuccess && (
        <View style={styles.imgContainer}>
          <Image source={require("../../assets/images/order2.gif")} />
          <ThemedText style={{ fontSize: 18, marginBottom: 50, marginTop: -90, fontWeight: 600, fontFamily: 'PoppinsBold'}}>
            {i18n.t('order_placed')}
          </ThemedText>
        </View>
      )}
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
              {selectedProduct?.offers?.length > 0 &&
                selectedProduct?.offers.map((item, index) => (
                  <TouchableOpacity
                    style={{ flexDirection: "row" }}
                    onPress={() => {
                      item["selectedOffer"] = item?._id
                      setModalVisible(false);
                    }}
                    key={index}
                  >
                    <View
                      style={{
                        ...styles.radio,
                        borderRadius: 50,
                        borderColor: primaryColor,
                        backgroundColor: selectedProduct?.selectedOffer === item?._id ? primaryColor : "transparent",
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

export default MyCart;

const styles = StyleSheet.create({
  carContainer: {
    flex: 1,
    flexDirection: "column",
    marginBottom: 10,
    marginTop: 5,
    marginHorizontal: 1,
    borderRadius: 10,
    // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    // Android shadow
    elevation: 3,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  cardImage: {
    width: "20%",
    height: 80,
    borderRadius: 10,
  },
  cardImageModal: {
    width: "22%",
    height: 65,
    borderRadius: 10,
  },
  cardDetail: {
    flex: 1,
    flexDirection: "column",
    marginLeft: 15,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  imageModal: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  textContainer: {
    paddingVertical: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 600,
  },
  price: {
    fontSize: 14,
    color: "gray",
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
  cardButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cartButtonMain: {
    width: "90%",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderRadius: 10,
    marginLeft: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cartButton: {
    paddingVertical: 5,
    width: "30%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  imgContainer: {
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
});
