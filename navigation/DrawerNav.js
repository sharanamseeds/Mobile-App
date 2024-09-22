import { createDrawerNavigator } from "@react-navigation/drawer";
import TabOne from "../screens/tabs/Home";
import TabTwo from "../screens/tabs/Ledger";
import { Feather } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";
import { DrawerActions } from "@react-navigation/native";
import { useThemeColor } from "../hook/useThemeColor";
import { ThemedView } from "../components/ThemedView";
import { ThemedText } from "../components/ThemedText";
import CustomDrawerContent from "../components/CustomDrawerContent";

const Drawer = createDrawerNavigator();

const CustomHeader = () => {
  return(
    <View>
      <ThemedText style={{fontSize: 20, fontWeight: 600}}>
        Hii Ravi!
      </ThemedText>
      <ThemedText style={{fontSize: 12, fontWeight: 600, color: "grey"}}>
        Enjoy our services !
      </ThemedText>
    </View>
  )
}

const DrawerNav = ({ navigation }) => {
  const textColor = useThemeColor({}, 'text')
  const lightColor = useThemeColor({}, 'lightColor')
  const darkColor = useThemeColor({}, 'darkColor')
  const primaryColor = useThemeColor({}, 'primary')
  const background = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  return (
    <>
      <Drawer.Navigator
        initialRouteName="TabOne"
        drawerContent={props => <CustomDrawerContent {...props} />}
        screenOptions={{
          drawerActiveBackgroundColor: primaryColor,
          drawerActiveTintColor: "#f5f5f5",
          headerTintColor: textColor,
          headerStyle:{
            backgroundColor: background,
            elevation: 0,
            shadowOpacity: 0,
            height: 70
          },
          headerTitleStyle:{
            fontFamily: 'Poppins',
            fontWeight: 800
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}>
              <Feather
                name="align-left"
                size={24}
                style={{ marginLeft: 15, backgroundColor: "#f5f5f5", padding: 5, borderRadius: 50 }}
                color={"black"}
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}>
              <Feather
                name="bell"
                size={24}
                style={{ marginRight: 15, backgroundColor: "#f5f5f5", padding: 5, borderRadius: 50 }}
                color={"black"}
              />
            </TouchableOpacity>
          ),
        }}
      >
        <Drawer.Screen
          name="TabOne"
          options={{ headerTitle: (props) => <CustomHeader {...props}/>}}
          component={TabOne}
        />
        <Drawer.Screen name="TabTwo" component={TabTwo} />
      </Drawer.Navigator>
    </>
  );
};

export default DrawerNav;
