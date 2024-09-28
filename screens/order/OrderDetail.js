import {
  Text,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
} from "react-native";
import ThemeSafeAreaView from "../../components/ThemeSafeAreaView";
import { ThemedView } from "../../components/ThemedView";
import { useThemeColor } from "../../hook/useThemeColor";
import { ThemedText } from "../../components/ThemedText";
import { useContext, useEffect, useState } from "react";
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import { DOWNLOADBILL, ORDERDETAIL, RETURNORDER } from "../../constant/ApiRoutes";
import { GetServerImage, ShowErrorToast, ShowSuccessToast } from "../../helper/helper";
import { AuthContext } from "../../context/authContext";
import moment from "moment";
import i18n from "../../i18n";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

const OrderDetail = ({ navigation, route }) => {
  // theme color
  const boxColor = useThemeColor({}, "boxColor");
  const boxShadow = useThemeColor({}, "boxShadow");
  const primaryColor = useThemeColor({}, "primary");
  const secondaryColor = useThemeColor({}, "secondary");
  const { pid } = route.params;
  const [orderDetail, setOrderDetail] = useState([]);
  const { showLoader, hideLoader } = useContext(AuthContext);

  const status = [
    {
      label: "Pending",
      value: "pending",
      color: "#FCE83A",
    },
    {
      label: "Confirm",
      value: "confirm",
      color: "#56F000",
    },
    {
      label: "Reject",
      value: "rejected",
      color: "#FF3838",
    },
    {
      label: "Delivered",
      value: "delivered",
      color: "#2DCCFF",
    },
    {
      label: "Cancelled",
      value: "cancelled",
      color: "#FF3838",
    },
    {
      label: "Return Request",
      value: "return_requested",
      color: "#A4ABB6",
    },
    {
      label: "Return Accepted",
      value: "return_accepeted",
      color: "#56F000",
    },
    {
      label: "Return Reject",
      value: "return_rejected",
      color: "#FF3838",
    },
    {
      label: "Return Fulfilled",
      value: "return_fulfilled",
      color: "#FFB302",
    },
  ];

  const getOrderDetail = async (id) => {
    try {
      showLoader();
      const productDoc = await axios.get(`${ORDERDETAIL}/${id}?lang_code=${i18n.locale}`);
      setOrderDetail(productDoc?.data?.payload?.result);
      hideLoader();
    } catch (error) {
      hideLoader();
      console.log(error, "error");
    }
  };

  const downloadBill = async (id) => {
    try {
      showLoader();
      const result = await axios.get(`${DOWNLOADBILL}/${id}?lang_code=${i18n.locale}`);
      createAndDownloadPdf(result?.data);
    } catch (error) {
      console.log(error);
      hideLoader();
    }
  };

  const createAndDownloadPdf = async (htmlContent) => {
    try {
      // Generate the PDF
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      console.log(uri);
      // Define the file path where you want to save the PDF
      const fileName = `${FileSystem.documentDirectory}${orderDetail?._id}.pdf`;

      await FileSystem.copyAsync({
        from: uri,
        to: fileName,
      });

      // Optionally share the file after download
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileName);
      }

      hideLoader();
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  const returnOrder = async (order_id) => {
    try {
      showLoader();
      const result = await axios.post(
        `${RETURNORDER}/${order_id}?payload=${JSON.stringify({ reason: "return" })}&lang_code=${i18n.locale}`
      );
      ShowSuccessToast(result?.data?.message);
      hideLoader();
    } catch (error) {
      ShowErrorToast(error.response?.data?.message);
      hideLoader();
    }
  };

  useEffect(() => {
    console.log(pid);
    if (pid) {
      getOrderDetail(pid);
    }
  }, [pid]);

  return (
    <>
      <ThemeSafeAreaView>
        <ThemedView
          style={{
            paddingHorizontal: 15,
            borderBottomColor: "grey",
            borderBottomWidth: 2,
            paddingBottom: 15,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <ThemedText style={{ fontSize: 17 }}>{i18n.t("order_date")} :</ThemedText>
            <ThemedText style={{ fontSize: 16, fontWeight: 600, marginLeft: 10 }}>
              {orderDetail?.createdAt ? moment(orderDetail?.createdAt).format("DD MMM YYYY") : ""}
            </ThemedText>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <ThemedText style={{ fontSize: 17 }}>{i18n.t("order")} # :</ThemedText>
            <ThemedText style={{ fontSize: 16, fontWeight: 600, marginLeft: 10 }}>
              {orderDetail?._id}
            </ThemedText>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <ThemedText style={{ fontSize: 17 }}>{i18n.t("order_amount")} :</ThemedText>
            <ThemedText style={{ fontSize: 16, fontWeight: 600, marginLeft: 10 }}>
              ₹ {orderDetail?.billing_amount?.toFixed(2)}
            </ThemedText>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <ThemedText style={{ fontSize: 17 }}>{i18n.t("order_status")} :</ThemedText>
            <ThemedText
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginLeft: 10,
                color: status?.find((f) => f.value === orderDetail?.status)?.color,
              }}
            >
              {status?.find((f) => f.value === orderDetail?.status)?.label}
            </ThemedText>
          </View>
          {orderDetail?.is_creditable && (
            <TouchableOpacity
              style={{
                backgroundColor: secondaryColor,
                padding: 8,
                borderRadius: 50,
                marginTop: 8,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => returnOrder(orderDetail?._id)}
            >
              <Text
                style={{
                  color: "#FFF",
                  textAlign: "center",
                  fontSize: 18,
                  textTransform: "uppercase",
                }}
              >
                Return Order
              </Text>
              <Feather name="repeat" color="#FFF" size={20} style={{ marginLeft: 5 }} />
            </TouchableOpacity>
          )}
          {orderDetail?.bill_id && (
            <TouchableOpacity
              style={{
                backgroundColor: primaryColor,
                padding: 8,
                borderRadius: 50,
                marginTop: 8,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => downloadBill(orderDetail?.bill_id)}
            >
              <Text
                style={{
                  color: "#FFF",
                  textAlign: "center",
                  fontSize: 18,
                  textTransform: "uppercase",
                }}
              >
                Download Bill
              </Text>
              <Feather name="download" color="#FFF" size={20} style={{ marginLeft: 5 }} />
            </TouchableOpacity>
          )}
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
          <ThemedText style={{ fontSize: 18, marginBottom: 12 }}>
            {i18n.t("product_detail")}
          </ThemedText>
          {orderDetail?.products &&
            orderDetail?.products?.length > 0 &&
            orderDetail?.products.map((item, index) => (
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
                          ₹ {item?.total_amount?.toFixed(2)}
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={{ flex: 1, alignItems: "flex-end" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
                      <ThemedText style={{ color: "gray", fontSize: 12 }}>
                        {i18n.t("quantity")}:
                      </ThemedText>
                      <ThemedText style={{ fontSize: 12, marginLeft: 5 }}>
                        {item?.quantity}
                      </ThemedText>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
                      <ThemedText style={{ color: "gray", fontSize: 12 }}>
                        {i18n.t("item_total")}:
                      </ThemedText>
                      <ThemedText style={{ fontSize: 12, marginLeft: 5 }}>
                        ₹ {item?.total_amount?.toFixed(2)}
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
                      <ThemedText style={{ color: "gray", fontSize: 12 }}>
                        {i18n.t("tax")}:
                      </ThemedText>
                      <ThemedText style={{ fontSize: 12, marginLeft: 5 }}>
                        ₹ {item?.gst_amount?.toFixed(2)}
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
                      <ThemedText style={{ color: "gray", fontSize: 12 }}>
                        {i18n.t("discount")}:
                      </ThemedText>
                      <ThemedText style={{ fontSize: 12, marginLeft: 5 }}>
                        - ₹ {item?.offer_discount?.toFixed(2)}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </ThemedView>
            ))}
        </ThemedView>
      </ThemeSafeAreaView>
    </>
  );
};

export default OrderDetail;

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
});
