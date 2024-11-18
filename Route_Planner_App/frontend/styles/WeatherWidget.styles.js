import { StyleSheet } from "react-native";

export const weatherWidgetStyles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 110,
    right: 15,
    zIndex: 3,
    padding: 12,
    backgroundColor: "#33A001",
    borderRadius: 10,
    borderColor: "#FFF",
    borderWidth: 0.5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: "center",
    maxWidth: 120,
  },
  forecast: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 4,
    textAlign: "center",
  },
  area: {
    fontSize: 12,
    color: "#FFFFFF",
    marginTop: 2,
    textAlign: "center",
  },
});
