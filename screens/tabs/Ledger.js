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
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "../../components/ThemedText";
import { useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../../context/authContext";
import { LEDGERLIST, USERDETAIL } from "../../constant/ApiRoutes";
import moment from "moment";
import ThemeSafeAreaViewWOS from "../../components/ThemeSafeAreaViewWOS";
import { SearchBar } from "react-native-elements";
import { debounce } from "lodash";
import i18n from "../../i18n";

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
  const [selectedFilter, setSelectedFilter] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [filter, setFilter] = useState({
    type: "",
  });
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const { loading, showLoader, hideLoader } = useContext(AuthContext);

  const fetchLedger = async () => {
    try {
      const response = await axios.get(`${USERDETAIL}?lang_code=${i18n.locale}`);
      setLedgerData(response?.data?.payload?.result);
    } catch (error) {
      console.log(error?.response?.data?.message);
    }
  };

  const fetchLedgerList = async (reset = false, searchTerm = "") => {
    if (loading || (!hasMore && !reset)) return;
    setRefreshing(false);
    showLoader();
    try {
      const params = {
        page: reset ? 1 : page,
        search: searchTerm,
        type: filter?.type,
        lang_code: i18n.locale,
      };

      const response = await axios.get(LEDGERLIST, { params });
      const newData = response?.data?.payload?.result?.data || [];
      if (newData?.length > 0) {
        setLedgerList((prevData) => (reset ? newData : [...prevData, ...newData]));
        setPage((prevPage) => (reset ? 2 : prevPage + 1));
        setHasMore(true);
      } else {
        setHasMore(false);
      }
      setTimeout(() => {
        hideLoader();
      }, 2000);
    } catch (error) {
      hideLoader();
      console.log(error);
    }
  };

  const renderLedger = ({ item, index }) => {
    return (
      <View style={styles.transaction} key={index}>
        {console.log(item?.bill)}
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              backgroundColor: `${item?.type === "credit" ? primaryColor : secondaryColor}40`,
              padding: 5,
              borderRadius: 50,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 10,
            }}
          >
            <Feather
              name={item?.type === "credit" ? "credit-card" : "file-text"}
              size={24}
              color={item?.type === "credit" ? primaryColor : secondaryColor}
            />
          </View>
          <View>
            <ThemedText style={{ fontSize: 18, fontWeight: 500 }}>{item?.invoice_id}</ThemedText>
            <ThemedText>
              {item?.createdAt ? moment(item?.createdAt).format("DD MMM") : ""}
            </ThemedText>
          </View>
        </View>
        <View>
          <ThemedText
            style={{
              color: item?.type === "credit" ? primaryColor : secondaryColor,
              fontSize: 18,
            }}
          >
            {item?.type === "credit" ? "+" : "-"}
            {item?.payment_amount}
          </ThemedText>
        </View>
      </View>
    );
  };

  // Create a debounced version of the fetchResults function
  const debouncedFetchResults = useCallback(
    debounce((searchTerm) => fetchLedgerList(true, searchTerm), 1000),
    [fetchLedgerList]
  );

  const handleInputChange = (text) => {
    setSearch(text);
    setLedgerList([]);
    debouncedFetchResults(text);
  };

  const reloadData = () => {
    fetchLedger();
    fetchLedgerList();
  };

  useEffect(() => {
    fetchLedger();
  }, [i18n.locale]);

  useEffect(() => {
    setLedgerList([]);
    setHasMore(true);
    setPage(1);
    fetchLedgerList(true);
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
        keyExtractor={(item) => item?._id}
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
              {console.log(ledgerData, "led")}
              <View style={{flex:1, flexDirection: 'row', justifyContent: 'space-between'}}>
                <View style={{width: "50%"}}>
                  <ThemedText style={{ fontSize: 14 }}>{i18n.t("total_money_added")}</ThemedText>
                  <ThemedText style={{ fontSize: 16, fontWeight: 600, fontFamily: "PoppinsBold" }}>
                    ₹ {ledgerData?.totalMoneyAdded}
                  </ThemedText>
                </View>
                <View style={{width: "50%"}}>
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
             <View style={{flex:1, flexDirection: 'row', justifyContent: 'space-between'}}>
                <View style={{width: "50%"}}>
                  <ThemedText style={{ fontSize: 14 }}>{i18n.t("total_ledger_debit")}</ThemedText>
                  <ThemedText style={{ fontSize: 16, fontWeight: 600, fontFamily: "PoppinsBold" }}>
                    ₹ {ledgerData?.totalDebit}
                  </ThemedText>
                </View>
                <View style={{width: "50%"}}>
                  <ThemedText style={{ fontSize: 14 }}>{i18n.t("final_balance")}</ThemedText>
                  <ThemedText style={{ fontSize: 16, fontWeight: 600, fontFamily: "PoppinsBold" }}>
                    ₹ {ledgerData?.finalBalance}
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
              <ThemedText style={{ fontSize: 18, marginBottom: 5 }}>
                {i18n.t("all_transaction_list")}
              </ThemedText>
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
        onEndReached={() => fetchLedgerList()}
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
              height: "25%",
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
            <View style={{ marginTop: 15 }}>
              <TouchableOpacity
                style={{ flexDirection: "row" }}
                onPress={() => {
                  setSelectedFilter("");
                  setFilter({ ...filter, type: "" });
                  setModalVisible(false);
                }}
              >
                <View
                  style={{
                    ...styles.radio,
                    borderRadius: 50,
                    borderColor: primaryColor,
                    backgroundColor: selectedFilter === "" ? primaryColor : "transparent",
                    marginRight: 10,
                    marginBottom: 15,
                  }}
                ></View>
                <ThemedText>{i18n.t("all")}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flexDirection: "row" }}
                onPress={() => {
                  setSelectedFilter("credit");
                  setFilter({ ...filter, type: "credit" });
                  setModalVisible(false);
                }}
              >
                <View
                  style={{
                    ...styles.radio,
                    borderRadius: 50,
                    backgroundColor: selectedFilter === "credit" ? primaryColor : "transparent",
                    borderColor: primaryColor,
                    marginRight: 10,
                    marginBottom: 15,
                  }}
                ></View>
                <ThemedText>{i18n.t("by_credit")}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flexDirection: "row" }}
                onPress={() => {
                  setSelectedFilter("debit");
                  setFilter({ ...filter, type: "debit" });
                  setModalVisible(false);
                }}
              >
                <View
                  style={{
                    ...styles.radio,
                    borderRadius: 50,
                    backgroundColor: selectedFilter === "debit" ? primaryColor : "transparent",
                    borderColor: primaryColor,
                    marginRight: 10,
                  }}
                ></View>
                <ThemedText>{i18n.t("by_debit")}</ThemedText>
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
