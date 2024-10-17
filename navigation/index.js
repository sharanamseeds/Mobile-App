import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AuthNav from "./AuthStack";
import Ledger from "../screens/tabs/Ledger";
import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { useColorScheme } from "../hook/useColorScheme";
import { useThemeColor } from "../hook/useThemeColor";
import Icon from "react-native-vector-icons/Ionicons";
import { ThemedText } from "../components/ThemedText";
import { TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Home from "../screens/tabs/Home";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Product from "../screens/tabs/Product";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/authContext";
import ProductDetail from "../screens/product/ProductDetail";
import User from "../screens/tabs/User";
import MyAccount from "../screens/profile/MyAccount";
import MyCart from "../screens/profile/MyCart";
import MyOrder from "../screens/profile/MyOrder";
import ChangePassword from "../screens/profile/ChangePassword";
import SplashScreen from "../components/SplashScreen";
import ProductFilter from "../screens/product/ProductFilter";
import GlobalLoader from "../components/GlobalLoading";
import OrderDetail from "../screens/order/OrderDetail";
import ProfileEdit from "../screens/profile/EditProfile";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { SETCARTITEM } from "../redux/cart/CartSlice";
import i18n from "../i18n";
import Language from "../screens/Languages/language";
import axios from "axios";
import { GETCART } from "../constant/ApiRoutes";
import PaymentDetail from "../screens/paymentDetail/paymentDetail";

const Stack = createNativeStackNavigator();
const BottomTab = createBottomTabNavigator();

const CustomHeader = () => {
  const { userName } = useContext(AuthContext);
  return (
    <View>
      <ThemedText style={{ fontSize: 20, fontWeight: 600 }}>
        {i18n.t("hi")} {userName}!
      </ThemedText>
      <ThemedText style={{ fontSize: 12, fontWeight: 600, color: "grey" }}>
        {i18n.t("enjoy")} !
      </ThemedText>
    </View>
  );
};

const CustomTitle = ({ title }) => {
  return (
    <View>
      <ThemedText style={{ fontSize: 20, fontWeight: 600 }}>{title}</ThemedText>
    </View>
  );
};

const TabNav = ({ navigation }) => {
  const textColor = useThemeColor({}, "text");
  const lightColor = useThemeColor({}, "lightColor");
  const darkColor = useThemeColor({}, "darkColor");
  const primaryColor = useThemeColor({}, "primary");
  const background = useThemeColor({ light: lightColor, dark: darkColor }, "background");

  return (
    <>
      <BottomTab.Navigator
        initialRouteName="HomeStack"
        screenOptions={({ route }) => ({
          headerTintColor: textColor,
          headerStyle: {
            backgroundColor: background,
            elevation: 0,
            shadowOpacity: 0,
            height: 70,
          },
          headerTitleStyle: {
            fontFamily: "Poppins",
            fontWeight: 800,
          },
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.navigate("Language")}>
              <Feather
                name="globe"
                size={23}
                style={{
                  marginRight: 15,
                  marginBottom: 12,
                  backgroundColor: "#f5f5f5",
                  padding: 5,
                  borderRadius: 50,
                }}
                color={"black"}
              />
            </TouchableOpacity>
          ),
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "HomeStack") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "Product") {
              iconName = focused ? "bag" : "bag-outline";
            } else if (route.name === "Order") {
              iconName = focused ? "browsers" : "browsers-outline";
            } else if (route.name === "Ladger") {
              iconName = focused ? "newspaper" : "newspaper-outline";
            } else if (route.name === "Profile") {
              iconName = focused ? "person" : "person-outline";
            }

            return (
              <>
                {focused && (
                  <View
                    style={{
                      width: "50%",
                      position: "absolute",
                      top: "-40%",
                      borderTopWidth: 3,
                      borderTopColor: primaryColor,
                      borderRadius: 20,
                    }}
                  ></View>
                )}
                <Icon name={iconName} size={size} color={color} />
              </>
            );
          },
          tabBarLabel: ({ focused, color }) => {
            let label;
            if (route.name === "HomeStack") {
              label = i18n.t("home");
            } else if (route.name === "Product") {
              label = i18n.t("product");
            } else if (route.name === "Order") {
              label = i18n.t("orders");
            } else if (route.name === "Ladger") {
              label = i18n.t("ladger");
            } else if (route.name === "Profile") {
              label = i18n.t("profile");
            }

            return (
              <ThemedText
                style={{
                  color,
                  fontWeight: focused ? 600 : "normal",
                  fontSize: 14,
                }}
              >
                {label}
              </ThemedText>
            );
          },

          tabBarActiveTintColor: primaryColor,
          tabBarInactiveTintColor: "gray",
          tabBarStyle: {
            backgroundColor: background,
            elevation: 10, // Add shadow on Android
            shadowOpacity: 0.25, // Add shadow on iOS
            shadowOffset: { width: 0, height: 2 }, // Shadow offset
            shadowRadius: 4, // Shadow radius
            paddingTop: 10,
            paddingBottom: 10,
            height: 68,
          },
        })}
      >
        <BottomTab.Screen
          name="HomeStack"
          options={{
            headerTitle: (props) => <CustomHeader {...props} />,
            unmountOnBlur: true
          }}
          component={Home}
        />
        <BottomTab.Screen
          name="Product"
          component={Product}
          options={{
            headerTitle: (props) => <CustomTitle {...props} title={i18n.t("product")} />,
            unmountOnBlur: true,
            headerTitleAlign: "center",
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Feather
                  name="chevron-left"
                  size={30}
                  style={{ marginLeft: 15 }}
                  color={textColor}
                />
              </TouchableOpacity>
            ),
          }}
        />
        <BottomTab.Screen
          name="Order"
          component={MyOrder}
          options={{
            headerTitle: (props) => <CustomTitle {...props} title={i18n.t("order")} />,
            headerTitleAlign: "center",
            unmountOnBlur: true,
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Feather
                  name="chevron-left"
                  size={30}
                  style={{ marginLeft: 15 }}
                  color={textColor}
                />
              </TouchableOpacity>
            ),
          }}
        />
        <BottomTab.Screen
          name="Ladger"
          component={Ledger}
          options={{
            headerTitle: (props) => <CustomTitle {...props} title={i18n.t("ladger")} />,
            headerTitleAlign: "center",
            unmountOnBlur: true,
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Feather
                  name="chevron-left"
                  size={30}
                  style={{ marginLeft: 15 }}
                  color={textColor}
                />
              </TouchableOpacity>
            ),
          }}
        />
        <BottomTab.Screen
          name="Profile"
          component={User}
          options={{
            headerTitle: (props) => <CustomTitle {...props} title={i18n.t("profile")} />,
            headerTitleAlign: "center",
            unmountOnBlur: true,
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Feather
                  name="chevron-left"
                  size={30}
                  style={{ marginLeft: 15 }}
                  color={textColor}
                />
              </TouchableOpacity>
            ),
          }}
        />
      </BottomTab.Navigator>
    </>
  );
};

//main Stack Navigator
const StackNav = () => {
  const { token, authLoading } = useContext(AuthContext);
  const textColor = useThemeColor({}, "text");
  const lightColor = useThemeColor({}, "lightColor");
  const darkColor = useThemeColor({}, "darkColor");
  const background = useThemeColor({ light: lightColor, dark: darkColor }, "background");
  return (
    <Stack.Navigator
      screenOptions={{
        animation: "none",
      }}
    >
      <Stack.Screen
        name="Home"
        component={
          authLoading === null || authLoading === true ? SplashScreen : token ? TabNav : AuthNav
        }
        options={{ title: null, headerShown: false }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetail}
        options={({ navigation }) => ({
          headerTitle: (props) => <CustomTitle {...props} title={i18n.t("product_detail")} />,
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: background,
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Feather name="chevron-left" size={30} style={{ marginLeft: 0 }} color={textColor} />
            </TouchableOpacity>
          ),
          headerBackVisible: false,
        })}
      />
      <Stack.Screen
        name="Account"
        component={MyAccount}
        options={({ navigation }) => ({
          headerTitle: (props) => <CustomTitle {...props} title={i18n.t("my_account")} />,
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: background,
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Feather name="chevron-left" size={30} style={{ marginLeft: 0 }} color={textColor} />
            </TouchableOpacity>
          ),
          headerBackVisible: false,
        })}
      />
      <Stack.Screen
        name="Cart"
        component={MyCart}
        options={({ navigation }) => ({
          headerTitle: (props) => <CustomTitle {...props} title={i18n.t("my_cart")} />,
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: background,
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Feather name="chevron-left" size={30} style={{ marginLeft: 0 }} color={textColor} />
            </TouchableOpacity>
          ),
          headerBackVisible: false,
        })}
      />
      <Stack.Screen
        name="Order"
        component={MyOrder}
        options={({ navigation }) => ({
          headerTitle: (props) => <CustomTitle {...props} title={i18n.t("my_order")} />,
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: background,
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Feather name="chevron-left" size={30} style={{ marginLeft: 0 }} color={textColor} />
            </TouchableOpacity>
          ),
          headerBackVisible: false,
        })}
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetail}
        options={({ navigation }) => ({
          headerTitle: (props) => <CustomTitle {...props} title={i18n.t("order_detail")} />,
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: background,
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Feather name="chevron-left" size={30} style={{ marginLeft: 0 }} color={textColor} />
            </TouchableOpacity>
          ),
          headerBackVisible: false,
        })}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePassword}
        options={({ navigation }) => ({
          headerTitle: (props) => <CustomTitle {...props} title={i18n.t("change_password")} />,
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: background,
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Feather name="chevron-left" size={30} style={{ marginLeft: 0 }} color={textColor} />
            </TouchableOpacity>
          ),
          headerBackVisible: false,
        })}
      />
      <Stack.Screen
        name="ProductFilter"
        component={ProductFilter}
        options={({ navigation }) => ({
          headerTitle: (props) => <CustomTitle {...props} title={i18n.t("product")} />,
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: background,
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Feather name="chevron-left" size={30} style={{ marginLeft: 0 }} color={textColor} />
            </TouchableOpacity>
          ),
          headerBackVisible: false,
        })}
      />
      <Stack.Screen
        name="EditProfile"
        component={ProfileEdit}
        options={({ navigation }) => ({
          headerTitle: (props) => <CustomTitle {...props} title={i18n.t("edit_profile")} />,
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: background,
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Feather name="chevron-left" size={30} style={{ marginLeft: 0 }} color={textColor} />
            </TouchableOpacity>
          ),
          headerBackVisible: false,
        })}
      />
       <Stack.Screen
        name="PaymentDetail"
        component={PaymentDetail}
        options={({ navigation }) => ({
          headerTitle: (props) => <CustomTitle {...props} title={i18n.t("payment_detail")} />,
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: background,
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Feather name="chevron-left" size={30} style={{ marginLeft: 0 }} color={textColor} />
            </TouchableOpacity>
          ),
          headerBackVisible: false,
        })}
      />
      <Stack.Screen
        name="Language"
        component={Language}
        options={({ navigation }) => ({
          headerTitle: (props) => <CustomTitle {...props} title={i18n.t("language")} />,
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: background,
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Feather name="chevron-left" size={30} style={{ marginLeft: 0 }} color={textColor} />
            </TouchableOpacity>
          ),
          headerBackVisible: false,
        })}
      />
    </Stack.Navigator>
  );
};

const setCartItems = async() => {
  try {
    const response = await axios.get(GETCART)
    let cartData = []
    if (response.data?.payload?.result?.data?.length > 0) {
      response.data?.payload?.result?.data?.map((cart, index) => {
        cartData.push({_id: cart?.product_id, ...cart.product, qty: cart?.quantity, selectedOffer: cart?.selectedOffer || null, cart_id: cart?._id})
      })
    }
    return cartData
  } catch(error) {
    console.log(error)
  }
}

const Navbar = () => {
  const colorScheme = useColorScheme();
  const { loading, setUserName, changeLanguage } = useContext(AuthContext);
  const dispatch = useDispatch();

  const setCartItem = async () => {
    const CartItem = await setCartItems();
    dispatch(SETCARTITEM(CartItem));
    const userData = (await AsyncStorage.getItem("user_data"))
      ? JSON.parse(await AsyncStorage.getItem("user_data"))
      : {};
    setUserName(userData?.name);
    changeLanguage((await AsyncStorage.getItem("lang")) || "en");
  };

  useEffect(() => {
    setCartItem();
  }, []);

  return (
    <>
      <NavigationContainer theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <GestureHandlerRootView>
          <StackNav />
        </GestureHandlerRootView>
      </NavigationContainer>
      {/* <GlobalLoader visible={loading} /> */}
    </>
  );
};

export default Navbar;
