import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useThemeColor } from "../hook/useThemeColor";
import { Feather } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import axios from "axios";
import { CALCULATEBILL } from "../constant/ApiRoutes";
import i18n from "../i18n";

const CartItemTotal = ({ navigation }) => {
  const primaryColor = useThemeColor({}, "primary");
  const [billingAmount, setBillingAmount] = useState(0)
  const { cartItem } = useSelector((state) => state?.cartItem);

  const getProductTotal = async() => {
    try {
      let Product = []
      if (cartItem?.length > 0) {
        cartItem.map((p) => Product.push({product_id: p?._id, offer_id: p?.selectedOffer || null , quantity: p?.qty}))
      }
      const productParams = JSON.stringify({products: Product})
      const result = await axios.post(`${CALCULATEBILL}?payload=${productParams}&lang_code=${i18n.locale}`)
      setBillingAmount(result?.data?.payload?.result?.billing_amount)
    } catch (error){
      console.log(error?.response?.data, "error")
    }
  }

  useEffect(() => {
    if (cartItem?.length > 0) {
      getProductTotal()
    }
  }, [cartItem])

  return (
    cartItem && cartItem?.length > 0 && <View
      style={{
        ...styles.cartTotalBox,
        backgroundColor: primaryColor,
      }}
    >
      <View>
        <Text style={{ fontSize: 20, fontWeight: 600, color: "#FFF", fontFamily: "PoppinsBold" }}>
        ₹ {billingAmount?.toFixed(2)}
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#FFF",
            fontFamily: "Poppins",
            marginTop: -8,
          }}
        >
          {cartItem?.length} {i18n.t('items')}
        </Text>
      </View>
      <View>
        <TouchableOpacity
          style={{
            backgroundColor: "#FFF",
            borderRadius: 10,
            paddingVertical: 5,
            paddingHorizontal: 8,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => {
            navigation.navigate("Cart");
          }}
        >
          <Feather name="shopping-bag" size={20} color={primaryColor} />
          <Text
            style={{ color: primaryColor, fontSize: 16, fontFamily: "Poppins", marginLeft: 10 }}
          >
            {i18n.t('go_to_cart')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CartItemTotal;

const styles = StyleSheet.create({
  cartTotalBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
    bottom: 0,
    padding: 8,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: "100%",
    shadowColor: "#FFF",
    // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    // Android shadow
    elevation: 3,
  },
});
