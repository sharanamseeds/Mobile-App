import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ForgotPassword from "../screens/auth/ForgotPassword";
import Login from "../screens/auth/Login";
import Signup from "../screens/auth/SignUp";

const AuthStack = createNativeStackNavigator();

const AuthNav = () => {
  return (
    <>
      <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="Login" component={Login} />
        <AuthStack.Screen name="SignUp" component={Signup} />
        <AuthStack.Screen name="ForgotPassword" component={ForgotPassword} />
      </AuthStack.Navigator>
    </>
  );
};

export default AuthNav;
