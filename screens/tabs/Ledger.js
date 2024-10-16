import {
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedView } from "../../components/ThemedView";
import { useThemeColor } from "../../hook/useThemeColor";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemedText } from "../../components/ThemedText";
import { useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../../context/authContext";
import { LEDGERLIST, USERDETAIL } from "../../constant/ApiRoutes";
import moment from "moment";
import ThemeSafeAreaViewWOS from "../../components/ThemeSafeAreaViewWOS";
import { SearchBar } from "react-native-elements";
import { debounce } from "lodash";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import i18n from "../../i18n";
import { Buffer } from "buffer";

const Ledger = ({ navigation }) => {
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "primary");
  const secondaryColor = useThemeColor({}, "secondary");
  const lightColor = useThemeColor({}, "lightColor");
  const darkColor = useThemeColor({}, "darkColor");
  const boxColor = useThemeColor({}, "boxColor");
  const boxShadow = useThemeColor({}, "boxShadow");
  const background = useThemeColor({ light: lightColor, dark: darkColor }, "background");
  const [ledgerData, setLedgerData] = useState({});
  const [ledgerList, setLedgerList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [filter, setFilter] = useState({
    type: "",
    date: ""
  });
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const { showLoader, hideLoader } = useContext(AuthContext);

  const fetchLedgerList = async (searchTerm = "") => {
    setRefreshing(true);
    showLoader();
    try {
      const params = {
        search: searchTerm,
        category: filter?.type,
        date: filter?.date,
        lang_code: i18n.locale,
      };

      const response = await axios.get(LEDGERLIST, { params });
      setLedgerData(response.data?.payload?.result);
      const newData = response.data?.payload?.result?.groupedData || [];
      let LedgerArr = [];
      if (newData?.length > 0) {
        newData.map((credit, index) => {
          LedgerArr[index] = { month: credit?.month };
          let DataArr = [];
          if (credit?.credits?.length > 0) {
            credit?.credits?.map((cr) => {
              DataArr.push({
                ...cr,
                type: "credit",
                invoice_id: "Amount Credited",
                payment_amount: cr?.amount,
              });
            });
          }
          if (credit?.ledgers?.length > 0) {
            credit?.ledgers?.map((ld) => {
              DataArr.push(ld);
            });
          }
          DataArr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          LedgerArr[index] = { ...LedgerArr[index], data: DataArr };
        });
      }
      setLedgerList(LedgerArr);
      setRefreshing(false);
      setTimeout(() => {
        hideLoader();
      }, 2000);
    } catch (error) {
      hideLoader();
      console.log(error);
    }
  };

  const downloadPDF = async () => {
    try {
      const params = {
        category: filter?.type,
        date: filter?.date,
        lang_code: i18n.locale,
      };
      const response = await axios.get(`${LEDGERLIST}/download/pdf`, { params });
      createAndDownloadPdf(response?.data);
      console.log(response?.data);
    } catch (error) {
      console.log(error);
    }
  };

  const createAndDownloadPdf = async (htmlContent) => {
    try {
      // Generate the PDF
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      // Define the file path where you want to save the PDF
      const fileName = `${FileSystem.documentDirectory}history.pdf`;

      await FileSystem.copyAsync({
        from: uri,
        to: fileName,
      });

      // Optionally share the file after download
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileName);
      }

      hideLoader();
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  const downloadExcel = async () => {
    try {
      const params = {
        category: filter?.type,
        date: filter?.date,
        lang_code: i18n.locale,
      };
      const response = await axios.get(`${LEDGERLIST}/download/excel`, {
        params,
        responseType: "arraybuffer", // Use 'arraybuffer' for binary data
      });

      // Create a temporary file path
      const fileUri = FileSystem.documentDirectory + "data.xlsx";

      // Write the binary data to file
      await FileSystem.writeAsStringAsync(fileUri, Buffer.from(response.data).toString("base64"), {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Check if sharing is available
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Sharing is not available on this platform");
        return;
      }

      // Share the file
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.log(error);
    }
  };

  const renderLedger = ({ item, index }) => {
    return (
      <View key={index}>
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 5,
            backgroundColor: secondaryColor,
            borderRadius: 50,
            marginHorizontal: 15,
            marginTop: 5,
          }}
        >
          <ThemedText
            style={{
              textAlign: "center",
              color: "#FFF",
              fontWeight: 600,
              fontFamily: "PoppinsBold",
            }}
          >
            {item?.month}
          </ThemedText>
        </View>
        {item?.data?.length > 0 &&
          item?.data?.map((cr) => {
            return (
              <TouchableOpacity
                style={styles.transaction}
                key={cr?._id}
                onPress={() => navigation.navigate("PaymentDetail", { payment: cr })}
              >
                <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      backgroundColor: `${cr?.type === "credit" ? primaryColor : secondaryColor}40`,
                      padding: 5,
                      borderRadius: 50,
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 10,
                    }}
                  >
                    <Feather
                      name={cr?.type === "credit" ? "credit-card" : "file-text"}
                      size={24}
                      color={cr?.type === "credit" ? primaryColor : secondaryColor}
                    />
                  </View>
                  <View>
                    <ThemedText style={{ fontSize: 18, fontWeight: 500 }}>
                      {cr?.invoice_id}
                    </ThemedText>
                    <ThemedText>
                      {cr?.createdAt ? moment(cr?.createdAt).format("DD MMM") : ""}
                    </ThemedText>
                  </View>
                </View>
                <View>
                  <ThemedText
                    style={{
                      color: cr?.type === "credit" ? primaryColor : secondaryColor,
                      fontSize: 18,
                    }}
                  >
                    {cr?.type === "credit" ? "+" : "-"}
                    {cr?.payment_amount}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            );
          })}
      </View>
    );
  };

  // Create a debounced version of the fetchResults function
  const debouncedFetchResults = useCallback(
    debounce((searchTerm) => fetchLedgerList(searchTerm), 1000),
    [fetchLedgerList]
  );

  const handleInputChange = (text) => {
    setSearch(text);
    debouncedFetchResults(text);
  };

  const reloadData = () => {
    fetchLedgerList();
  };

  useEffect(() => {
    setLedgerList([]);
    fetchLedgerList();
    navigation.setOptions({
      title: i18n.t("ladger"),
    });
  }, [filter, i18n.locale]);

  return (
    <ThemeSafeAreaViewWOS>
      <FlatList
        nestedScrollEnabled={true}
        scrollEnabled={true}
        data={ledgerList}
        keyExtractor={(item, index) => index}
        showsVerticalScrollIndicator={false}
        renderItem={renderLedger}
        ListHeaderComponent={
          <>
            <ThemedView
              style={{
                paddingHorizontal: 15,
                borderBottomColor: "grey",
                borderBottomWidth: 2,
                paddingBottom: 5,
              }}
            >
              <View>
                <ThemedText style={{ fontSize: 16 }}>{i18n.t("bank_detail")}</ThemedText>
                <ThemedText style={{ fontSize: 15, fontWeight: 600 }}>
                  {i18n.t("account_name")} : SHARNAM SEEDS
                </ThemedText>
                <ThemedText style={{ fontSize: 15, fontWeight: 600 }}>
                  {i18n.t("account_no")} : 923020023452363
                </ThemedText>
                <ThemedText style={{ fontSize: 15, fontWeight: 600 }}>
                  {i18n.t("ifsc_code")} : UTIB0004734
                </ThemedText>
              </View>
            </ThemedView>
            <ThemedView
              style={{
                paddingHorizontal: 15,
                paddingVertical: 5,
                marginTop: 1,
                marginBottom: 1,
              }}
            >
              <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
                <View style={{ width: "50%" }}>
                  <ThemedText style={{ fontSize: 14 }}>{i18n.t("total_money_added")}</ThemedText>
                  <ThemedText style={{ fontSize: 16, fontWeight: 600, fontFamily: "PoppinsBold" }}>
                    ₹ {ledgerData?.totalMoneyAdded}
                  </ThemedText>
                </View>
                <View style={{ width: "50%" }}>
                  <ThemedText style={{ fontSize: 14 }}>{i18n.t("total_ledger_credit")}</ThemedText>
                  <ThemedText style={{ fontSize: 16, fontWeight: 600, fontFamily: "PoppinsBold" }}>
                    ₹ {ledgerData?.totalCredit}
                  </ThemedText>
                </View>
              </View>
            </ThemedView>
            <ThemedView
              style={{
                paddingHorizontal: 15,
                paddingVertical: 5,
                borderBottomColor: "grey",
                borderBottomWidth: 2,
                marginTop: 1,
                marginBottom: 1,
              }}
            >
              <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
                <View style={{ width: "50%" }}>
                  <ThemedText style={{ fontSize: 14 }}>{i18n.t("total_ledger_debit")}</ThemedText>
                  <ThemedText style={{ fontSize: 16, fontWeight: 600, fontFamily: "PoppinsBold" }}>
                    ₹ {ledgerData?.totalDebit}
                  </ThemedText>
                </View>
                <View style={{ width: "50%" }}>
                  <ThemedText style={{ fontSize: 14 }}>{i18n.t("final_balance")}</ThemedText>
                  <ThemedText style={{ fontSize: 16, fontWeight: 600, fontFamily: "PoppinsBold" }}>
                    ₹ {ledgerData?.availableCreditLimit}
                  </ThemedText>
                </View>
              </View>
            </ThemedView>
            <ThemedView
              style={{
                paddingHorizontal: 15,
                borderTopColor: "grey",
                borderTopWidth: 2,
                paddingTop: 15,
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <ThemedText style={{ fontSize: 18 }}>{i18n.t("all_transaction_list")}</ThemedText>
                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity
                    onPress={() => downloadPDF()}
                    style={{ backgroundColor: `${primaryColor}40`, padding: 5, borderRadius: 50 }}
                  >
                    <MaterialCommunityIcons name="file-download" color={primaryColor} size={24} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => downloadExcel()}
                    style={{
                      marginLeft: 10,
                      backgroundColor: `${secondaryColor}40`,
                      padding: 5,
                      borderRadius: 50,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="microsoft-excel"
                      color={secondaryColor}
                      size={24}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <ThemedView
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <SearchBar
                  placeholder={i18n.t("search_by_invoice")}
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
                  <Feather
                    name="git-commit"
                    size={20}
                    color={textColor}
                    style={{ marginTop: -10 }}
                  />
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          </>
        }
        //ListFooterComponent={renderFooter}
        onEndReachedThreshold={0.5}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={10}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reloadData} />}
      />
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
              height: "80%",
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
            <ThemedText style={{ fontSize: 16, marginTop: 12 }}>{i18n.t("by_category")}</ThemedText>
            <View style={{ marginTop: 15 }}>
              <TouchableOpacity
                style={{ flexDirection: "row" }}
                onPress={() => {
                  setFilter({ ...filter, type: "" });
                  setModalVisible(false);
                }}
              >
                <View
                  style={{
                    ...styles.radio,
                    borderRadius: 50,
                    borderColor: primaryColor,
                    backgroundColor: filter?.type === "" ? primaryColor : "transparent",
                    marginRight: 10,
                    marginBottom: 10,
                  }}
                ></View>
                <ThemedText>{i18n.t("all")}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flexDirection: "row" }}
                onPress={() => {
                  setFilter({ ...filter, type: "credit_note" });
                  setModalVisible(false);
                }}
              >
                <View
                  style={{
                    ...styles.radio,
                    borderRadius: 50,
                    backgroundColor: filter?.type === "credit_note" ? primaryColor : "transparent",
                    borderColor: primaryColor,
                    marginRight: 10,
                    marginBottom: 10,
                  }}
                ></View>
                <ThemedText>{i18n.t("by_credit")}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flexDirection: "row" }}
                onPress={() => {
                  setFilter({ ...filter, type: "debit_note" });
                  setModalVisible(false);
                }}
              >
                <View
                  style={{
                    ...styles.radio,
                    borderRadius: 50,
                    backgroundColor: filter?.type === "debit_note" ? primaryColor : "transparent",
                    borderColor: primaryColor,
                    marginRight: 10,
                    marginBottom: 10,
                  }}
                ></View>
                <ThemedText>{i18n.t("by_debit")}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flexDirection: "row" }}
                onPress={() => {
                  setFilter({ ...filter, type: "invoice" });
                  setModalVisible(false);
                }}
              >
                <View
                  style={{
                    ...styles.radio,
                    borderRadius: 50,
                    backgroundColor: filter?.type === "invoice" ? primaryColor : "transparent",
                    borderColor: primaryColor,
                    marginRight: 10,
                    marginBottom: 10,
                  }}
                ></View>
                <ThemedText>{i18n.t("by_invoice")}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flexDirection: "row" }}
                onPress={() => {
                  setFilter({ ...filter, type: "payment" });
                  setModalVisible(false);
                }}
              >
                <View
                  style={{
                    ...styles.radio,
                    borderRadius: 50,
                    backgroundColor: filter?.type === "payment" ? primaryColor : "transparent",
                    borderColor: primaryColor,
                    marginRight: 10,
                    marginBottom: 10,
                  }}
                ></View>
                <ThemedText>{i18n.t("by_payment")}</ThemedText>
              </TouchableOpacity>
            </View>
            <ThemedText style={{ fontSize: 16, marginTop: 12 }}>{i18n.t("by_date")}</ThemedText>
            <View style={{ marginTop: 15 }}>
              <TouchableOpacity
                style={{ flexDirection: "row" }}
                onPress={() => {
                  setFilter({ ...filter, date: "" });
                  setModalVisible(false);
                }}
              >
                <View
                  style={{
                    ...styles.radio,
                    borderRadius: 50,
                    borderColor: primaryColor,
                    backgroundColor: filter?.date === "" ? primaryColor : "transparent",
                    marginRight: 10,
                    marginBottom: 10,
                  }}
                ></View>
                <ThemedText>{i18n.t("all")}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flexDirection: "row" }}
                onPress={() => {
                  setFilter({ ...filter, date: "current_year" });
                  setModalVisible(false);
                }}
              >
                <View
                  style={{
                    ...styles.radio,
                    borderRadius: 50,
                    borderColor: primaryColor,
                    backgroundColor: filter?.date === "current_year" ? primaryColor : "transparent",
                    marginRight: 10,
                    marginBottom: 10,
                  }}
                ></View>
                <ThemedText>{i18n.t("current_year")}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flexDirection: "row" }}
                onPress={() => {
                  setFilter({ ...filter, date: "past_year" });
                  setModalVisible(false);
                }}
              >
                <View
                  style={{
                    ...styles.radio,
                    borderRadius: 50,
                    borderColor: primaryColor,
                    backgroundColor: filter?.date === "past_year" ? primaryColor : "transparent",
                    marginRight: 10,
                    marginBottom: 10,
                  }}
                ></View>
                <ThemedText>{i18n.t("past_year")}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flexDirection: "row" }}
                onPress={() => {
                  setFilter({ ...filter, date: "last_three_month" });
                  setModalVisible(false);
                }}
              >
                <View
                  style={{
                    ...styles.radio,
                    borderRadius: 50,
                    borderColor: primaryColor,
                    backgroundColor:
                      filter?.date === "last_three_month" ? primaryColor : "transparent",
                    marginRight: 10,
                    marginBottom: 10,
                  }}
                ></View>
                <ThemedText>{i18n.t("last_three_month")}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flexDirection: "row" }}
                onPress={() => {
                  setFilter({ ...filter, date: "last_one_month" });
                  setModalVisible(false);
                }}
              >
                <View
                  style={{
                    ...styles.radio,
                    borderRadius: 50,
                    borderColor: primaryColor,
                    backgroundColor:
                      filter?.date === "last_one_month" ? primaryColor : "transparent",
                    marginRight: 10,
                    marginBottom: 10,
                  }}
                ></View>
                <ThemedText>{i18n.t("last_one_month")}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flexDirection: "row" }}
                onPress={() => {
                  setFilter({ ...filter, date: "last_one_year" });
                  setModalVisible(false);
                }}
              >
                <View
                  style={{
                    ...styles.radio,
                    borderRadius: 50,
                    borderColor: primaryColor,
                    backgroundColor:
                      filter?.date === "last_one_year" ? primaryColor : "transparent",
                    marginRight: 10,
                    marginBottom: 10,
                  }}
                ></View>
                <ThemedText>{i18n.t("last_one_year")}</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemeSafeAreaViewWOS>
  );
};

export default Ledger;

const styles = StyleSheet.create({
  pill: {
    backgroundColor: "#dceeeb",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 50,
    marginTop: 20,
    fontSize: 14,
  },
  transaction: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomColor: "grey",
    borderBottomWidth: 2,
    paddingVertical: 15,
    marginHorizontal: 15,
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
});
