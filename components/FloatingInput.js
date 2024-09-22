import { FloatingLabelInput } from "react-native-floating-label-input";
import { useThemeColor } from "../hook/useThemeColor";
import { Text, View } from "react-native";

const FloatingInput = ({ label, name, formDetail, handleChange, error }) => {
  const primaryColor = useThemeColor({}, "primary");
  const textColor = useThemeColor({}, "text");
  const bgColor = useThemeColor({}, "background");
  return (
    <View>
      <FloatingLabelInput
        label={label}
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
      />
      {error ? <Text style={{marginTop: -22, marginBottom: 10, color: '#FF9494'}}>{error}</Text> : ""}
    </View>
  );
};

export default FloatingInput;
