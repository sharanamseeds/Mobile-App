import { useDispatch, useSelector } from "react-redux";
import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useThemeColor } from "../../hook/useThemeColor";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/authContext";
import { ORDERLIST } from "../../constant/ApiRoutes";
import axios from "axios";
import { GetServerImage } from "../../helper/helper";
import ThemeSafeAreaViewWOS from "../../components/ThemeSafeAreaViewWOS";
import moment from "moment";
import i18n from "../../i18n";

const MyOrder = ({ navigation }) => {
  const dispatch = useDispatch();
  const [modalVisible, setModalVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(true);
  const [orderListData, setOrderListData] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState({
    status: "",
    order_type: "",
  });
  const [filter, setFilter] = useState({
    status: "",
    order_type: "",
  });

  const { loading, showLoader, hideLoader } = useContext(AuthContext);
  const windowHeight = Dimensions.get("window").height;
  // theme color
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "primary");
  const secondaryColor = useThemeColor({}, "secondary");
  const boxColor = useThemeColor({}, "boxColor");
  const boxShadow = useThemeColor({}, "boxShadow");

  const status = [
    {
      label: "Pending",
      value: "pending",
    },
    {
      label: "Confirm",
      value: "confirm",
    },
    {
      label: "Reject",
      value: "rejected",
    },
    {
      label: "Delivered",
      value: "delivered",
    },
    {
      label: "Cancelled",
      value: "cancelled",
    },
    {
      label: "Return Request",
      value: "return_requested",
    },
    {
      label: "Return Accepted",
      value: "return_accepeted",
    },
    {
      label: "Return Reject",
      value: "return_rejected",
    },
    {
      label: "Return Fulfilled",
      value: "return_fulfilled",
    },
  ];

  const orderType = [
    {
      label: "Buy",
      value: "buy",
    },
    {
      label: "Sell",
      value: "sell",
    },
  ];

  const renderOrder = ({ item, index }) => {
    return (
      <ThemedView
        style={{ ...styles.carContainer, backgroundColor: boxColor, shadowColor: boxShadow }}
        key={item?._id}
      >
        <View style={{ ...styles.card }}>
          <View style={styles.cardImage}>
            <TouchableOpacity onPress={() => navigation.navigate("OrderDetail", { pid: item._id })}>
              <Image
                source={{
                  uri: GetServerImage(item?.products?.[0]?.product_id?.images?.[0]?.value),
                }}
                style={styles.image}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.cardDetail}>
            <View style={styles.textContainer}>
              <TouchableOpacity
                onPress={() => navigation.navigate("OrderDetail", { pid: item._id })}
              >
                <ThemedText style={{ ...styles.title }}>
                  {status.find((f) => f.value === item?.status)?.label}
                </ThemedText>
                <ThemedText style={{ ...styles.price, marginTop: -2 }}>
                  {item?.order_type?.toUpperCase()} On{" "}
                  {item?.createdAt ? moment(item?.createdAt).format("DD MMM YYYY") : ""}
                </ThemedText>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <ThemedText style={{ ...styles.title }}>
                    ₹ {item?.billing_amount?.toFixed(2)}
                  </ThemedText>
                  <ThemedText style={{ ...styles.price, marginLeft: 10 }}>
                    ( {item?.products?.length} Product{item?.products?.length > 1 ? "s" : ""} )
                  </ThemedText>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <Feather name="chevron-right" color={textColor} size={24} />
        </View>
      </ThemedView>
    );
  };

  const orderList = async (reset = false) => {
    if (loading || (!hasMore && !reset)) return;
    showLoader();
    setRefreshing(false);
    try {
      const params = {
        status: filter?.status,
        order_type: filter?.order_type,
        page: reset ? 1 : page,
        lang_code: i18n.locale
      };

      const response = await axios.get(ORDERLIST, { params });

      const newData = response?.data?.payload?.result?.data || [];
      if (newData?.length > 0) {
        setOrderListData((prevData) => (reset ? newData : [...prevData, ...newData]));
        setPage((prevPage) => (reset ? 2 : prevPage + 1));
        setHasMore(true);
      } else {
        setHasMore(false);
      }
     setTimeout(() => {
        hideLoader();
      }, 2000);
    } catch (error) {
      console.error(error);
      hideLoader();
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    setOrderListData([]);
    setHasMore(true);
    setPage(1);
    orderList(true);
    navigation.setOptions({
      title: i18n.t('order'),
    });
  }, [filter, i18n.locale]);

  return (
    <ThemeSafeAreaViewWOS style={{ paddingHorizontal: 15 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <ThemedText type="title" style={{ fontSize: 22 }}>
          {i18n.t('orders')}
        </ThemedText>
        <TouchableOpacity
          style={{
            width: 45,
            paddingHorizontal: 10,
            height: 45,
            flexDirection: "column",
            justifyContent: "center",
            borderRadius: 10,
            paddingVertical: 2,
            borderColor: primaryColor,
            borderWidth: 2,
          }}
          onPress={() => setModalVisible(true)}
        >
          <Feather name="git-commit" size={20} color={textColor} />
          <Feather name="git-commit" size={20} color={textColor} style={{ marginTop: -10 }} />
        </TouchableOpacity>
      </View>
      <ThemedView style={{ marginTop: 10, marginBottom: 50 }}>
        {orderListData && orderListData?.length > 0 ? (
          <>
            {refreshing ? <ActivityIndicator size="large" color={primaryColor} /> : ""}
            <FlatList
              data={orderListData}
              keyExtractor={(item) => item?._id}
              renderItem={renderOrder}
              showsVerticalScrollIndicator={false}
              //ListFooterComponent={renderFooter}
              onEndReached={() => orderListData?.length > 4 && orderList()}
              onEndReachedThreshold={0.5}
              initialNumToRender={10}
              maxToRenderPerBatch={5}
              windowSize={10}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={orderList} />}
            />
          </>
        ) : (
          <View
            style={{
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: windowHeight - 250,
            }}
          >
            <Image
              source={require("../../assets/images/cancel_8921363.png")}
              style={{ width: 100, height: 100 }}
            />
            <ThemedText type="title" style={{ fontSize: 22 }}>
              {i18n.t('no_order_found')}
            </ThemedText>
          </View>
        )}
      </ThemedView>
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
              height: "68%",
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: textColor, fontSize: 20, fontWeight: 600 }}>{i18n.t('filters')}</Text>
              <Feather
                name="x"
                size={22}
                style={{ marginTop: 8 }}
                color={textColor}
                onPress={() => setModalVisible(!modalVisible)}
              />
            </View>
            <ThemedText style={{ fontSize: 18, marginTop: 12 }}>{i18n.t('by_status')}</ThemedText>
            <View style={{ marginTop: 15 }}>
              {status?.length > 0 &&
                status.map((item, index) => (
                  <TouchableOpacity
                    style={{ flexDirection: "row" }}
                    key={index}
                    onPress={() => {
                      setSelectedFilter({ ...selectedFilter, status: item?.value });
                      setFilter({ ...filter, status: item?.value });
                      setModalVisible(false);
                    }}
                  >
                    <View
                      style={{
                        ...styles.radio,
                        borderRadius: 50,
                        borderColor: primaryColor,
                        backgroundColor:
                          selectedFilter?.status === item?.value ? primaryColor : "transparent",
                        marginRight: 10,
                        marginBottom: 15,
                      }}
                    ></View>
                    <ThemedText>{item?.label}</ThemedText>
                  </TouchableOpacity>
                ))}
            </View>
            <TouchableOpacity
              style={{ flexDirection: "row", backgroundColor: secondaryColor, width: '100%', padding: 10, borderRadius: 50, marginTop: 10 , alignItems: 'center', justifyContent: 'center'}}
              onPress={() => {
                setFilter({ order_type: "", status: "" });
                setSelectedFilter({ order_type: "", status: "" });
                setModalVisible(false);
              }}
            >
              <Feather name="trash" size={18} color={"#FFF"} />
              <Text style={{ color: "#FFF", marginRight: 15, fontSize: 18 }}>{i18n.t('clear_filter')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ThemeSafeAreaViewWOS>
  );
};

export default MyOrder;

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
  radio: {
    height: 20,
    width: 20,
    borderRadius: 50,
    borderWidth: 1,
  },
});
