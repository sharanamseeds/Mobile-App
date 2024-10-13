import { Dimensions, StyleSheet, Text, View } from "react-native";
import { ThemedView } from "../../components/ThemedView";
import ThemeSafeAreaView from "../../components/ThemeSafeAreaView";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";
import { useThemeColor } from "../../hook/useThemeColor";
import { TouchableOpacity } from "react-native";
import { ThemedText } from "../../components/ThemedText";

const Language = ({navigation}) => {
  const primaryColor = useThemeColor({}, "primary");
  const boxShadow = useThemeColor({}, "boxShadow");
  const { changeLanguage } = useContext(AuthContext);

  const Languages = [
    {
      lang: "English",
      code: "en",
    },
    {
      lang: "हिन्दी",
      code: "hi",
    },
    {
      lang: "ગુજરાતી",
      code: "gu",
    },
  ];
  return (
    <ThemeSafeAreaView style={{ paddingHorizontal: 15 }} isReloadable={false}>
      <ThemedView style={{ marginTop: 20 }}>
        <View style={styles.centeredView}>
          <View
            style={{
              paddingHorizontal: 20,

              height: "100%",
            }}
          >
            <View style={{ marginTop: 15 }}>
              {Languages.map((language, index) => (
                <TouchableOpacity
                  style={{
                    ...styles.carContainer,
                    backgroundColor: "#FFF",
                    shadowColor: boxShadow,
                  }}
                  onPress={() => {
                    changeLanguage(language?.code);
                    navigation.goBack()
                  }}
                  key={index}
                >
                  <View style={{ ...styles.card }}>
                    <View style={styles.cardDetail}>
                      <ThemedText style={{ color: primaryColor, fontSize: 25 }}>
                        {language?.lang}
                      </ThemedText>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ThemedView>
    </ThemeSafeAreaView>
  );
};

export default Language;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  carContainer: {
    flexDirection: "column",
    marginBottom: 10,
    padding: 10,
    marginTop: 5,
    marginHorizontal: 1,
    borderRadius: 50,
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
  cardDetail: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
});
