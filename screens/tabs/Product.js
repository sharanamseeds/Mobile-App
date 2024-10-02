import { SearchBar } from "react-native-elements";
import { ThemedView } from "../../components/ThemedView";
import { useThemeColor } from "../../hook/useThemeColor";
import { Feather, Entypo } from "@expo/vector-icons";
import { useCallback, useContext, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import { ThemedText } from "../../components/ThemedText";
import ThemeSafeAreaViewWOS from "../../components/ThemeSafeAreaViewWOS";
import { useSelector } from "react-redux";
import CartItemTotal from "../../components/CartItemTotal";
import axios from "axios";
import { BRANDLIST, CATEGORYLIST, PRODUCTLIST } from "../../constant/ApiRoutes";
import { GetServerImage } from "../../helper/helper";
import debounce from "lodash/debounce";
import { AuthContext } from "../../context/authContext";
import i18n from "../../i18n";

const Product = ({ navigation, route }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("category");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [brands, setBrands] = useState([]);
  const [category, setCategories] = useState([]);
  const [product, setProduct] = useState([]);
  const [filters, setFilters] = useState({
    category_id: "all",
    brand_id: "all",
  });

  const { cartItem } = useSelector((state) => state?.cartItem);
  const { loading, showLoader, hideLoader, addCart, addQty, removeQty, removeCartItem } = useContext(AuthContext);
  const screenHeight = Dimensions.get("window").height;
  // theme color
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "primary");
  const lightColor = useThemeColor({}, "lightColor");
  const darkColor = useThemeColor({}, "darkColor");
  const boxColor = useThemeColor({}, "boxColor");
  const boxShadow = useThemeColor({}, "boxShadow");
  const background = useThemeColor({ light: lightColor, dark: darkColor }, "background");

  const checkItemInCart = (id) => {
    if (cartItem && cartItem?.length > 0) {
      return cartItem?.find((f) => f?._id === id);
    }
  };

  const checkOutOfStock = (totalQty, itemId) => {
    let itemQty = checkItemInCart(itemId)?.qty ? checkItemInCart(itemId)?.qty : 1;
    if (totalQty === itemQty) {
      return true;
    } else {
      return false;
    }
  };

  const renderCategory = ({ item, index }) => {
    return (
      <>
        <ThemedText
          style={{
            marginRight: category.length === index ? 0 : 20,
            color: filters?.category_id === item?._id ? primaryColor : textColor,
            borderBottomWidth: filters?.category_id === item?._id ? 2 : 0,
            borderBottomColor: primaryColor,
          }}
          onPress={() => setFilters({ ...filters, brand_id: "", category_id: item?._id })}
          key={item?._id}
        >
          {item?.category_name}
        </ThemedText>
      </>
    );
  };

  const renderBrand = ({ item, index }) => {
    return (
      <>
        <ThemedText
          style={{
            marginRight: brands.length === index ? 0 : 20,
            color: filters?.brand_id === item?._id ? primaryColor : textColor,
            borderBottomWidth: filters?.brand_id === item?._id ? 2 : 0,
            borderBottomColor: primaryColor,
          }}
          onPress={() => setFilters({ ...filters, category_id: "", brand_id: item?._id })}
          key={item?._id}
        >
          {item?.brand_name}
        </ThemedText>
      </>
    );
  };

  const renderProduct = ({ item, index }) => {
    return (
      <ThemedView
        style={{ ...styles.carContainer, backgroundColor: boxColor, shadowColor: boxShadow }}
        key={item?._id}
      >
        <View style={{ ...styles.card }}>
          <View style={styles.cardImage}>
            <TouchableOpacity
              onPress={() => navigation.navigate("ProductDetail", { pid: item._id })}
            >
              <Image
                source={{
                  uri: GetServerImage(item?.logo),
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
                <ThemedText style={{ ...styles.title }}>₹ {item?.price}</ThemedText>
              </TouchableOpacity>
            </View>
            {item?.in_stock ? (
              <View style={styles.cardButton}>
                {!checkItemInCart(item?._id) ? (
                  <TouchableOpacity
                    style={{
                      width: "100%",
                      backgroundColor: primaryColor,
                      padding: 5,
                      borderRadius: 10,
                      marginVertical: 10,
                    }}
                    disabled={checkOutOfStock(item?.quantity, item?._id)}
                    onPress={() => addCart({ ...item, qty: 1 })}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        color: "#FFF",
                        fontSize: 16,
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
                        checkItemInCart(item?._id)?.qty === 1
                          ? removeCartItem(item)
                          : removeQty(item)
                      }
                    >
                      <Feather
                        name={checkItemInCart(item?._id)?.qty === 1 ? "trash-2" : "minus"}
                        size={24}
                        color={"#FFF"}
                      />
                    </TouchableOpacity>
                    <Text style={{ backgroundColor: "#FFF", fontSize: 18 }}>
                      {checkItemInCart(item?._id)?.qty}
                    </Text>
                    <TouchableOpacity
                      style={{
                        ...styles.cartButton,
                        backgroundColor: primaryColor,
                        borderTopRightRadius: 10,
                        borderBottomRightRadius: 10,
                        marginRight: -1,
                      }}
                      disabled={checkOutOfStock(item?.quantity, item?._id)}
                      onPress={() => addQty(item)}
                    >
                      <Feather name="plus" size={24} color={"#FFF"} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : (
              <Text style={{ color: "#FF3838" }}>{i18n.t("out_of_stock")}</Text>
            )}
          </View>
        </View>
        {item?.offers?.length > 0 && (
          <TouchableOpacity
            style={{ ...styles.offerCard, backgroundColor: `${primaryColor}80` }}
            onPress={() => navigation.navigate("ProductDetail", { pid: item._id })}
          >
            <View style={{ ...styles.offerDetail }}>
              <Entypo name="price-tag" size={24} color={textColor} />
              <ThemedText style={{ marginLeft: 5 }}>{item?.offers?.[0]?.offer_name}</ThemedText>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
              <ThemedText>{i18n.t("view_offer")}</ThemedText>
              <Feather name="chevron-right" size={18} color={textColor} />
            </View>
          </TouchableOpacity>
        )}
      </ThemedView>
    );
  };

  // Create a debounced version of the fetchResults function
  const debouncedFetchResults = useCallback(
    debounce((searchTerm) => fetchProducts(true, searchTerm), 1000),
    [fetchProducts]
  );

  const handleInputChange = (text) => {
    setSearch(text);
    setProduct([]);
    debouncedFetchResults(text);
  };

  const fetchProducts = async (reset = false, searchTerm = "") => {
    if (loading || (!hasMore && !reset)) return;
    showLoader();
    setRefreshing(false);
    try {
      const params = {
        brand_id: filters?.brand_id === "all" ? "" : filters?.brand_id,
        category_id: filters?.category_id === "all" ? "" : filters?.category_id,
        search: searchTerm,
        page: reset ? 1 : page,
        lang_code: i18n.locale,
      };

      const response = await axios.get(PRODUCTLIST, { params });

      const newData = response?.data?.payload?.result?.data || [];
      if (newData?.length > 0) {
        setProduct((prevData) => (reset ? newData : [...prevData, ...newData]));
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
    }
  };

  const getCategories = async () => {
    try {
      const response = await axios.get(`${CATEGORYLIST}?lang_code=${i18n.locale}`);
      setCategories([
        { _id: "all", category_name: i18n.t("all") },
        ...response?.data?.payload?.result?.data,
      ]);
    } catch (error) {
      console.log(error);
    }
  };

  const getBrands = async () => {
    try {
      const response = await axios.get(`${BRANDLIST}?lang_code=${i18n.locale}`);
      setBrands([
        { _id: "all", brand_name: i18n.t("all") },
        ...response?.data?.payload?.result?.data,
      ]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getCategories();
    getBrands();
    navigation.setOptions({
      title: i18n.t("product"),
    });
  }, [i18n.locale]);

  useEffect(() => {
    setProduct([]);
    setHasMore(true);
    setPage(1);
    fetchProducts(true);
  }, [filters, i18n.locale]);

  return (
    <>
      <ThemeSafeAreaViewWOS style={{ paddingHorizontal: 15 }}>
        <ThemedView
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <SearchBar
            placeholder={i18n.t("type_here")}
            round={true}
            containerStyle={{
              backgroundColor: background,
              borderWidth: 0,
              borderColor: background,
              width: "84%",
              padding: 0,
            }}
            inputContainerStyle={{
              backgroundColor: "transparent",
              borderColor: primaryColor,
              borderWidth: 2,
              borderBottomColor: primaryColor,
              borderBottomWidth: 2,
              borderRadius: 50,
            }}
            searchIcon={() => <Feather name="search" size={24} color={textColor} />}
            onChangeText={(e) => handleInputChange(e)}
            value={search}
          />
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
        </ThemedView>
        {selectedFilter === "category" ? (
          <ThemedView style={{ marginVertical: 12 }}>
            <FlatList
              nestedScrollEnabled={false}
              scrollEnabled={true}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              data={category}
              key={(item) => item._id}
              renderItem={renderCategory}
            />
          </ThemedView>
        ) : (
          <ThemedView style={{ marginVertical: 12 }}>
            <FlatList
              nestedScrollEnabled={false}
              scrollEnabled={true}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              data={brands}
              key={(item) => item._id}
              renderItem={renderBrand}
            />
          </ThemedView>
        )}
        {refreshing ? <ActivityIndicator size="large" color={primaryColor} /> : ""}
        {product?.length > 0 ? (
          <FlatList
            data={product}
            keyExtractor={(item) => item?._id}
            renderItem={renderProduct}
            showsVerticalScrollIndicator={false}
            //ListFooterComponent={renderFooter}
            onEndReached={() => product?.length > 4 && fetchProducts()}
            onEndReachedThreshold={0.5}
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            windowSize={10}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchProducts} />}
          />
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
              {i18n.t("product_not_found")}
            </ThemedText>
          </View>
        )}
      </ThemeSafeAreaViewWOS>
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
              height: "22%",
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: textColor, fontSize: 20, fontWeight: 600 }}>
                {i18n.t("filters")}
              </Text>
              <Feather
                name="x"
                size={22}
                style={{ marginTop: 8 }}
                color={textColor}
                onPress={() => setModalVisible(!modalVisible)}
              />
            </View>
            <View style={{ marginTop: 15 }}>
              <TouchableOpacity
                style={{ flexDirection: "row" }}
                onPress={() => {
                  setSelectedFilter("category");
                  setFilters({ ...filters, category_id: "all", brand_id: "" });
                  setModalVisible(false);
                }}
              >
                <View
                  style={{
                    ...styles.radio,
                    borderRadius: 50,
                    borderColor: primaryColor,
                    backgroundColor: selectedFilter === "category" ? primaryColor : "transparent",
                    marginRight: 10,
                    marginBottom: 15,
                  }}
                ></View>
                <ThemedText>{i18n.t("by_category")}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flexDirection: "row" }}
                onPress={() => {
                  setSelectedFilter("brand");
                  setFilters({ ...filters, brand_id: "all", category_id: "" });
                  setModalVisible(false);
                }}
              >
                <View
                  style={{
                    ...styles.radio,
                    borderRadius: 50,
                    backgroundColor: selectedFilter === "brand" ? primaryColor : "transparent",
                    borderColor: primaryColor,
                    marginRight: 10,
                  }}
                ></View>
                <ThemedText>{i18n.t("by_brand")}</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <CartItemTotal navigation={navigation} />
    </>
  );
};

export default Product;

const styles = StyleSheet.create({
  carContainer: {
    flex: 1,
    flexDirection: "column",
    marginBottom: 10,
    padding: 10,
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
  },
  cardImage: {
    width: "30%",
    height: 120,
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
  textBox: {
    width: "48%",
    padding: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "grey",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  cartButtonMain: {
    width: "100%",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderRadius: 10,
    marginVertical: 10,
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
  loader: {
    marginVertical: 16,
    alignItems: "center",
  },
});
