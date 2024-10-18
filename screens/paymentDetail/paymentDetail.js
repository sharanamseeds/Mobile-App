import { Feather } from "@expo/vector-icons";
import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";
import ThemeSafeAreaView from "../../components/ThemeSafeAreaView";
import { Image, StyleSheet, View } from "react-native";
import { useThemeColor } from "../../hook/useThemeColor";
import moment from "moment";
import { GetServerImage } from "../../helper/helper";
import { TouchableOpacity } from "react-native";
import i18n from "../../i18n";

const PaymentDetail = ({ navigation, route }) => {
  const { payment } = route.params;
  const primaryColor = useThemeColor({}, "primary");
  const secondaryColor = useThemeColor({}, "secondary");
  const boxColor = useThemeColor({}, "boxColor");
  const boxShadow = useThemeColor({}, "boxShadow");
  return (
    <ThemeSafeAreaView isReloadable={false}>
      <ThemedView>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 15,
            borderBottomColor: "grey",
            borderBottomWidth: 2,
            marginBottom: 2,
          }}
        >
          <View>
            <ThemedText>{i18n.t('payment_amounts')}</ThemedText>
            <ThemedText style={{ fontSize: 28, fontWeight: 600, fontFamily: "PoppinsBold" }}>
              {" "}
              ₹ {payment?.payment_amount}
            </ThemedText>
          </View>
          <View
            style={{
              backgroundColor: `${payment?.type === "credit" ? primaryColor : secondaryColor}40`,
              borderRadius: 50,
              padding: 10,
            }}
          >
            <Feather
              name={payment?.type === "credit" ? "trending-up" : "trending-down"}
              size={50}
              color={payment?.type === "credit" ? primaryColor : secondaryColor}
            />
          </View>
        </View>
        <View
          style={{
            borderTopColor: "grey",
            borderTopWidth: 2,
            borderBottomColor: "grey",
            borderBottomWidth: payment?.bill ? 2 : 0,
            marginBottom: payment?.bill ? 2 : 0,
          }}
        >
          <View style={{ padding: 15 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <ThemedText>{i18n.t('payment_date')}</ThemedText>
              <ThemedText>{moment(payment?.createdAt).format("DD-MM-YYYY HH:mm:ss")}</ThemedText>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <ThemedText>{i18n.t('invoice_id')}</ThemedText>
              <ThemedText>{payment?.invoice_id}</ThemedText>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <ThemedText>{i18n.t('description')}</ThemedText>
              <ThemedText>{payment?.description || "-"}</ThemedText>
            </View>
          </View>
        </View>
        {payment?.bill && (
          <View
            style={{
              borderTopColor: "grey",
              borderTopWidth: 2,
            }}
          >
            <View style={{paddingHorizontal: 15, marginTop:5}}>
              <ThemedView
                style={{
                  ...styles.carContainer,
                  backgroundColor: boxColor,
                  shadowColor: boxShadow,
                }}
              >
                <View style={{ ...styles.card }}>
                  <View style={styles.cardImage}>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate("OrderDetail", { pid: payment?.bill?.order_id })
                      }
                    >
                      {payment?.bill?.payment_details && (
                        <Image
                          source={{
                            uri: GetServerImage(payment?.bill?.payment_details),
                          }}
                          style={styles.image}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                  <View style={styles.cardDetail}>
                    <View style={styles.textContainer}>
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate("OrderDetail", { pid: payment?.bill?.order_id })
                        }
                      >
                        <ThemedText style={{ ...styles.title }}>
                          {payment?.bill?.invoice_id}
                        </ThemedText>
                        <ThemedText style={{ ...styles.price, marginTop: -2 }}>
                          {payment?.bill?.payment_status} ( {payment?.bill?.payment_method} )
                        </ThemedText>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <ThemedText
                            style={{ ...styles.title, fontWeight: 600, fontFamily: "PoppinsBold" }}
                          >
                            ₹ {payment?.bill?.bill_amount?.toFixed(2)}
                          </ThemedText>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </ThemedView>
            </View>
          </View>
        )}
      </ThemedView>
    </ThemeSafeAreaView>
  );
};

export default PaymentDetail;

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
});
