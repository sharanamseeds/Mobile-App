import { FloatingLabelInput } from "react-native-floating-label-input";
import { useThemeColor } from "../hook/useThemeColor";
import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

const FloatingPasswordInput = ({ label, name, formDetail, handleChange, error }) => {
  const primaryColor = useThemeColor({}, "primary");
  const textColor = useThemeColor({}, "text");
  const bgColor = useThemeColor({}, "background");

  return (
    <View>
      <FloatingLabelInput
        label={label}
        isPassword
        togglePassword={false}
        value={formDetail[name] || ""}
        containerStyles={{
          borderWidth: 2,
          marginBottom: 22,
          height: 55,
          borderRadius: 8,
          paddingHorizontal: 10,
          borderColor: error ? '#FF9494' : primaryColor,
        }}
        customLabelStyles={{
          colorFocused: error ? '#FF9494' : textColor,
          colorBlurred: error ? '#FF9494' : textColor,
          fontSizeFocused: 12,
        }}
        labelStyles={{
          backgroundColor: bgColor,
          color: textColor,
        }}
        inputStyles={{
          color: textColor,
        }}
        onChangeText={(val) => handleChange(name, val)}
        customShowPasswordComponent={<Feather name="eye-off" size={24} color={textColor} />}
        customHidePasswordComponent={<Feather name="eye" size={24} color={textColor} />}
      />
      {error ? <Text style={{marginTop: -22, marginBottom: 10, color: '#FF9494'}}>{error}</Text> : ""}
    </View>
  );
};

export default FloatingPasswordInput;
