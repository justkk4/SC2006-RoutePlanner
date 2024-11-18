import { StyleSheet, Dimensions } from "react-native";
import LoginStyles from "./LoginStyles";
import BackButtonStyles from "./BackButtonStyles";
const { height } = Dimensions.get("window");

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  topHalf: {
    backgroundColor: "#f5e8e6",
    flex: 1,
  },
  imageContainer: {
    alignItems: "left",
    flexGrow: 1
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
    marginTop: "90%",
    marginHorizontal: "10%",
    marginBottom: "20%",
    padding: 10,
    paddingTop: 20,
    backgroundColor: "#33A001",
    borderRadius: 25,
    position: 'absolute'
  },
  title: {
    fontSize: 55,
    fontWeight: "bold",
    fontStyle: "italic",
    fontFamily: "Inter_500Medium",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 55,
  },
  text: {
    fontSize: 18,
    textAlign: "center",
    fontFamily: "Inter_300Light",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  dataRow: {
    flexDirection: "row",
    alignItems: "baseline",
    alignSelf: "center",
  },
  data: {
    fontSize: 75,
    color: "#FFFFFF",
    fontWeight: "bold",
    fontFamily: "Inter_500Medium",
    fontStyle: "italic",
    lineHeight: 75,
    textAlign: "center",
  },
  unit: {
    fontSize: 25,
    color: "#FFFFFF",
    marginLeft: 5,
    textAlign: "center",
    fontFamily: "Inter_300Light",
    fontWeight: "bold",
    fontStyle: "italic",
  },
  button: {
    ...BackButtonStyles.button,
    width: "70%",
    height: "10%",
    alignSelf: "center",
    top: height * 0.86,
    marginHorizontal: "12%",
    shadowColor: '#00000',
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 5,
    shadowOpacity: 0.3
  },
  buttonText: {
    ...BackButtonStyles.buttonText,
    fontSize: 25,
  },
  image: {
    width: "100%",
    height: height * 2,
    marginBottom: -height*0.07,
    marginTop: -height*0.5
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 180,
    right: 0,
    bottom: 350,
    justifyContent: "right",
    alignItems: "right",
    zIndex: 10,
  },
});
