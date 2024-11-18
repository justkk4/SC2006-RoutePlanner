import { StyleSheet } from "react-native";

export default StyleSheet.create({
  item: {
    backgroundColor: "#FFFFFF",
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    marginLeft: 20,
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 125,
    height: 125,
    borderRadius: 20,
  },
  text: {
    fontSize: 18,
    fontFamily: "Inter_300Light",
    fontWeight: "light",
    color: "#33A000",
  },
  data: {
    fontSize: 25,
    fontFamily: "Inter_500Medium",
    fontWeight: "bold",
    color: "#33A000",
  },
  placeholder: {
    width: 125,
    height: 125,
    backgroundColor: "#f5e8e6",
    borderRadius: 20,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});
