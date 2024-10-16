import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import ThemeSafeAreaView from "../../components/ThemeSafeAreaView";
import Carousel from "react-native-reanimated-carousel";
import { Dimensions, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { useThemeColor } from "../../hook/useThemeColor";
import { FlatList } from "react-native-gesture-handler";
import CartItemTotal from "../../components/CartItemTotal";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { BANNER, BRANDLIST, CATEGORYLIST, PRODUCTLIST } from "../../constant/ApiRoutes";
import { AuthContext } from "../../context/authContext";
import { GetServerImage } from "../../helper/helper";
import i18n from "../../i18n";

const Home = ({ navigation }) => {
  const width = Dimensions.get("window").width;
  const primaryColor = useThemeColor({}, "primary");
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [CarouselData, setCarouselData] = useState([]);
  const [bannerData, setBannerData] = useState([]);
  const [featureProduct, setFeatureProduct] = useState([]);
  const { showLoader, hideLoader } = useContext(AuthContext);

  const moveToProduct = ({ name, value }) => {
    navigation.navigate("ProductFilter", { [name]: value });
  };

  const renderCategory = ({ item, index }) => {
    return (
      <TouchableOpacity
        key={`${index}_${item?.category_name}`}
        style={{
          marginRight: categories.length - 1 === index ? 0 : 20,
          alignItems: "center",
          width: 82,
        }}
        onPress={() => moveToProduct({ name: "category_id", value: item?._id })}
      >
        <Image
          source={{
            uri: GetServerImage(item?.logo),
          }}
          width={80}
          height={80}
          style={{ borderRadius: 10 }}
        />
        <ThemedText style={{ marginTop: 8, fontWeight: 600 }}>{item?.category_name}</ThemedText>
      </TouchableOpacity>
    );
  };

  const renderBrand = ({ item, index }) => {
    return (
      <TouchableOpacity
        key={`${index}_${item?.brand_name}`}
        style={{
          marginRight: brands.length - 1 === index ? 0 : 20,
          alignItems: "center",
          width: 82,
        }}
        onPress={() => moveToProduct({ name: "brand_id", value: item?._id })}
      >
        <Image
          source={{
            uri: GetServerImage(item?.logo),
          }}
          width={80}
          height={80}
          style={{ borderRadius: 10 }}
        />
        <ThemedText style={{ marginTop: 8, fontWeight: 600 }}>{item?.brand_name}</ThemedText>
      </TouchableOpacity>
    );
  };

  const renderFeatureProduct = ({ item, index }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        key={item?._id}
        onPress={() => navigation.navigate("ProductDetail", { pid: item?._id })}
      >
        <Image
          source={{
            uri: GetServerImage(item?.images?.[0]),
          }}
          style={styles.image}
        />
        <View style={styles.textContainer}>
          <ThemedText
            style={{ ...styles.title, color: "#000", fontWeight: 600, fontFamily: "PoppinsBold" }}
          >
            {item?.product_name}
          </ThemedText>
          <ThemedText style={{ ...styles.price, fontWeight: 600, fontFamily: "PoppinsBold" }}>
            ₹ {item?.price_with_gst}
          </ThemedText>
        </View>
      </TouchableOpacity>
    );
  };

  const getCategories = async () => {
    try {
      showLoader();
      const response = await axios.get(`${CATEGORYLIST}?lang_code=${i18n.locale}`);
      setCategories(response?.data?.payload?.result?.data);
    } catch (error) {
      console.log(error);
      hideLoader();
    }
  };

  const getBrands = async () => {
    try {
      showLoader();
      const response = await axios.get(`${BRANDLIST}?lang_code=${i18n.locale}`);
      setBrands(response?.data?.payload?.result?.data);
    } catch (error) {
      hideLoader();
      console.log(error);
    }
  };

  const getBanner = async () => {
    try {
      showLoader();
      const response = await axios.get(`${BANNER}?lang_code=${i18n.locale}`);
      setCarouselData(response.data?.payload?.result?.images);
      setBannerData(response.data?.payload?.result?.banners);
    } catch (error) {
      hideLoader();
      console.log(error);
    }
  };

  const getFeatureProduct = async () => {
    try {
      showLoader();
      const response = await axios.get(`${PRODUCTLIST}?is_featured=true&lang_code=${i18n.locale}`);
      setFeatureProduct(response.data?.payload?.result?.data);
      setTimeout(() => {
        hideLoader();
      }, 2000);
    } catch (error) {
      hideLoader();
      console.log(error);
    }
  };

  const pageReload = () => {
    getCategories();
    getBrands();
    getFeatureProduct();
    getBanner();
    navigation.setOptions({
      title: i18n.t("home"),
    });
  };

  useEffect(() => {
    getCategories();
    getBrands();
    getFeatureProduct();
    getBanner();
    navigation.setOptions({
      title: i18n.t("home"),
    });
  }, [i18n.locale]);

  return (
    <>
      <ThemeSafeAreaView onReload={pageReload}>
        {CarouselData?.length > 0 && (
          <ThemedView>
            <Carousel
              loop
              mode="parallax"
              width={width}
              height={width / 2}
              autoPlay={true}
              data={CarouselData}
              autoPlayInterval={5000}
              scrollAnimationDuration={1000}
              renderItem={({ item, index }) => (
                <ThemedView
                  style={{
                    flex: 1,
                    marginHorizontal: 4,
                    borderRadius: 20,
                    justifyContent: "center",
                  }}
                  key={index}
                >
                  <Image
                    source={{ uri: GetServerImage(item) }}
                    style={{ width: "100%", height: "100%", borderRadius: 20 }}
                  />
                </ThemedView>
              )}
            />
          </ThemedView>
        )}
        {categories && categories?.length > 0 && (
          <ThemedView
            style={{
              ...styles.cardCategory,
              backgroundColor: `${primaryColor}80`,
              borderRadius: 10,
            }}
          >
            <View style={{ paddingHorizontal: 20, paddingVertical: 10 }}>
              <ThemedText type="subtitle" style={{ fontWeight: 600, marginBottom: 10 }}>
                {i18n.t("categories")}
              </ThemedText>
              <FlatList
                nestedScrollEnabled={false}
                scrollEnabled={true}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                data={categories}
                renderItem={renderCategory}
                keyExtractor={(item) => item._id}
              />
            </View>
          </ThemedView>
        )}
        {featureProduct?.length > 0 && (
          <>
            <ThemedView style={{ marginTop: 22, paddingHorizontal: 15 }}>
              <ThemedText type="defaultSemiBold" style={{ fontSize: 22, fontWeight: 600 }}>
                {i18n.t("feature_product")}
              </ThemedText>
            </ThemedView>
            <ThemedView style={{ paddingHorizontal: 5 }}>
              <FlatList
                nestedScrollEnabled={false}
                scrollEnabled={true}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                data={featureProduct}
                renderItem={renderFeatureProduct}
                keyExtractor={(item) => item._id}
              />
            </ThemedView>
          </>
        )}

        {brands?.length > 0 && (
          <ThemedView
            style={{
              ...styles.cardCategory,
              backgroundColor: `${primaryColor}80`,
              borderRadius: 10,
              marginTop: 10,
              marginBottom: 20,
            }}
          >
            <View style={{ paddingHorizontal: 20, paddingVertical: 10 }}>
              <ThemedText type="subtitle" style={{ fontWeight: 600, marginBottom: 10 }}>
                {i18n.t("brand")}
              </ThemedText>
              <FlatList
                nestedScrollEnabled={false}
                scrollEnabled={true}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                data={brands}
                renderItem={renderBrand}
                keyExtractor={(item) => item._id}
              />
            </View>
          </ThemedView>
        )}
        {bannerData?.length > 0 && <ThemedView
          style={{
            flex: 1,
            marginHorizontal: 4,
            paddingHorizontal: 15,
            marginBottom: 10,
            borderRadius: 20,
            justifyContent: "center",
          }}
        >
          <Image
            source={{ uri: GetServerImage(bannerData?.[0]) }}
            style={{ width: "100%", height: 350, borderRadius: 20 }}
          />
        </ThemedView>}
      </ThemeSafeAreaView>
      <CartItemTotal navigation={navigation} />
    </>
  );
};

export default Home;

const styles = StyleSheet.create({
  cardCategory: {
    flex: 1,
  },
  carContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  card: {
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "white",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    margin: 10,
    width: 170,
  },
  image: {
    width: "100%",
    height: 150,
  },
  textContainer: {
    padding: 10,
  },
  title: {
    fontSize: 16,
  },
  price: {
    fontSize: 14,
    color: "gray",
  },
  button: {
    backgroundColor: "#19c394",
    borderRadius: 5,
    paddingVertical: 0,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 12,
    right: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});
