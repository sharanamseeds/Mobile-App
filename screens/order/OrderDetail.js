import {
  Text,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
  Modal,
} from "react-native";
import ThemeSafeAreaView from "../../components/ThemeSafeAreaView";
import { ThemedView } from "../../components/ThemedView";
import { useThemeColor } from "../../hook/useThemeColor";
import { ThemedText } from "../../components/ThemedText";
import { useContext, useEffect, useState } from "react";
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import { DOWNLOADBILL, ORDER, ORDERDETAIL, RETURNORDER } from "../../constant/ApiRoutes";
import { GetServerImage, ShowErrorToast, ShowSuccessToast } from "../../helper/helper";
import { AuthContext } from "../../context/authContext";
import moment from "moment";
import i18n from "../../i18n";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import FloatingInput from "../../components/FloatingInput";

const OrderDetail = ({ navigation, route }) => {
  // theme color
  const boxColor = useThemeColor({}, "boxColor");
  const boxShadow = useThemeColor({}, "boxShadow");
  const primaryColor = useThemeColor({}, "primary");
  const secondaryColor = useThemeColor({}, "secondary");
  const { pid } = route.params;
  const [orderDetail, setOrderDetail] = useState([]);
  const [showCancelModel, setShowCancelModel] = useState(false);
  const [reason, setReason] = useState({
    cancel: "",
    return: ""
  });
  const [error, setError] = useState({})
  const [showReturnModel, setShowReturnModel] = useState(false)
  const { showLoader, hideLoader } = useContext(AuthContext);
  const textColor = useThemeColor({}, "text");

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

  const returnOrder = async () => {
    try {
      if (!reason?.return) {
        setError({...error, "return": 'please enter reason'})
        return
      }
      showLoader();
      const result = await axios.post(
        `${RETURNORDER}/${pid}?payload=${JSON.stringify({ reason: reason?.return })}&lang_code=${
          i18n.locale
        }`
      );
      ShowSuccessToast(result?.data?.message);
      setShowReturnModel(false)
      getOrderDetail(pid)
      hideLoader();
    } catch (error) {
      ShowErrorToast(error.response?.data?.message);
      hideLoader();
    }
  };

  const cancelOrder = async () => {
    try {
      if (!reason?.cancel) {
        setError({...error, "cancel": 'please enter reason'})
        return
      }
      showLoader();
      const result = await axios.put(
        `${ORDER}/${pid}?payload=${JSON.stringify({reason: reason?.cancel, status: 'cancelled' })}&lang_code=${
          i18n.locale
        }`
      );
      ShowSuccessToast(result?.data?.message);
      setShowCancelModel(false)
      getOrderDetail(pid)
      hideLoader();
    } catch (error) {
      console.log(error.response?.data)
      ShowErrorToast(error.response?.data?.message);
      hideLoader();
    }
  };

  const reloadData = () => {
    if (pid) {
      getOrderDetail(pid);
    }
  };

  const handleChange = (name, value) => {
    setReason({[name]: value})
  }

  useEffect(() => {
    console.log(pid);
    if (pid) {
      getOrderDetail(pid);
    }
  }, [pid]);

  return (
    <>
      <ThemeSafeAreaView onReload={reloadData}>
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
          {orderDetail?.status === "pending" && (
            <TouchableOpacity
              style={{
                backgroundColor: "#FF3838",
                padding: 8,
                borderRadius: 50,
                marginTop: 8,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => setShowCancelModel(true)}
            >
              <Text
                style={{
                  color: "#FFF",
                  textAlign: "center",
                  fontSize: 18,
                  textTransform: "uppercase",
                }}
              >
                {i18n.t("cancel_order")}
              </Text>
              <Feather name="x-circle" color="#FFF" size={20} style={{ marginLeft: 5 }} />
            </TouchableOpacity>
          )}
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
                opacity: orderDetail?.is_retuned ? 0.5 : 1,
              }}
              disabled={orderDetail?.is_retuned}
              onPress={() => setShowReturnModel(true)}
            >
              <Text
                style={{
                  color: "#FFF",
                  textAlign: "center",
                  fontSize: 18,
                  textTransform: "uppercase",
                }}
              >
                {i18n.t('return_order')}
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
                {i18n.t('download_bill')}
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
                        <ThemedText
                          style={{ ...styles.title, fontWeight: 600, fontFamily: "PoppinsBold" }}
                        >
                          {item?.product_name}
                        </ThemedText>
                        <ThemedText style={{ ...styles.price, marginTop: -2 }}>
                          {item?.product_code}
                        </ThemedText>
                        <ThemedText
                          style={{ ...styles.title, fontWeight: 600, fontFamily: "PoppinsBold" }}
                        >
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
        <Modal
          animationType="slide"
          transparent={true}
          visible={showCancelModel}
          onRequestClose={() => {
            setShowCancelModel(!showCancelModel);
          }}
        >
          <View style={styles.centeredView}>
            <View
              style={{
                ...styles.modalView,
                backgroundColor: boxColor,
                shadowColor: boxShadow,
                height: "35%",
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: textColor, fontSize: 20, fontWeight: 600 }}>
                  {i18n.t("cancel_order")}
                </Text>
                <Feather
                  name="x"
                  size={22}
                  style={{ marginTop: 8 }}
                  color={textColor}
                  onPress={() => setShowCancelModel(!showCancelModel)}
                />
              </View>

              <FloatingInput
                label={i18n.t("reason")}
                name={"cancel"}
                formDetail={reason}
                handleChange={handleChange}
                error={error?.cancel}
                labelStyles={{backgroundColor: boxColor}}
                style={{marginTop: 20}}
              />

              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  backgroundColor: secondaryColor,
                  width: "100%",
                  padding: 10,
                  borderRadius: 50,
                  marginTop: 10,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => cancelOrder()}
              >
                <Feather name="x-circle" size={18} color={"#FFF"} />
                <Text style={{ color: "#FFF", marginLeft: 5, fontSize: 18 }}>
                  {i18n.t("cancel_order")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal
          animationType="slide"
          transparent={true}
          visible={showReturnModel}
          onRequestClose={() => {
            setShowReturnModel(!showReturnModel);
          }}
        >
          <View style={styles.centeredView}>
            <View
              style={{
                ...styles.modalView,
                backgroundColor: boxColor,
                shadowColor: boxShadow,
                height: "35%",
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: textColor, fontSize: 20, fontWeight: 600 }}>
                  {i18n.t("return_order")}
                </Text>
                <Feather
                  name="x"
                  size={22}
                  style={{ marginTop: 8 }}
                  color={textColor}
                  onPress={() => setShowReturnModel(!showReturnModel)}
                />
              </View>

              <FloatingInput
                label={i18n.t("reason")}
                name={"return"}
                formDetail={reason}
                handleChange={handleChange}
                error={error?.return}
                labelStyles={{backgroundColor: boxColor}}
                style={{marginTop: 20}}
              />

              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  backgroundColor: secondaryColor,
                  width: "100%",
                  padding: 10,
                  borderRadius: 50,
                  marginTop: 10,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => returnOrder()}
              >
                <Feather name="repeat" size={18} color={"#FFF"} />
                <Text style={{ color: "#FFF", marginLeft: 5, fontSize: 18 }}>
                  {i18n.t("return_order")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
});
