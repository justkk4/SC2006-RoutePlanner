import { StyleSheet } from "react-native";
import LoginStyles from "./LoginStyles";

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  topHalf: {
    ...LoginStyles.topHalf,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
  },
  bottomHalf: {
    ...LoginStyles.bottomHalf,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 30,
  },
  runHistoryContainer: {
    flex: 1,
    borderRadius: 30,
    marginTop: 20,
    backgroundColor: "#33A000",
  },
  title: {
    fontSize: 70,
    fontWeight: "bold",
    textAlign: "center",
    paddingTop: 30,
    fontFamily: "InterTight_700Bold_Italic",
    color: "#FFFFFF",
    lineHeight: 55,
  },
  listContent: {
    paddingTop: 10,
  },
});
