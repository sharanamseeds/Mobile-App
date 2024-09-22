import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { useThemeColor } from "../hook/useThemeColor";

const ButtonPrimary = ({ title, style, handlePress, themeColor="secondary" }) => {
  const secondaryColor = useThemeColor({}, themeColor);
  return (
    <TouchableOpacity
      onPress={() => handlePress()}
      style={{ ...styles.button, ...style, backgroundColor: secondaryColor }}
    >
      <Text style={{textAlign: 'center', color: '#FFF', fontSize:20, fontWeight: 600, fontFamily: 'Poppins'}}>{title}</Text>
    </TouchableOpacity>
  );
};

export default ButtonPrimary;

const styles = StyleSheet.create({
  button: {
    padding: 15,
    borderRadius: 50
  },
});
