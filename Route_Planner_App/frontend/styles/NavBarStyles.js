import { StyleSheet, Platform, StatusBar } from "react-native";

const STATUSBAR_HEIGHT = Platform.OS === "ios" ? 44 : StatusBar.currentHeight;
const APPBAR_HEIGHT = Platform.OS === "ios" ? 44 : 56;

const NavBarStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#33A001",
    height: STATUSBAR_HEIGHT + APPBAR_HEIGHT,
    paddingTop: STATUSBAR_HEIGHT,
    paddingHorizontal: 15,
    borderBottomColor: 'white',
    borderBottomWidth: 1   
  },
  hamburgerButton: {
    padding: 5,
    width: 34,
  },
  welcomeText: {
    color: "white",
    fontSize: 20,
    fontWeight: "semibold",
    flex: 1,
    textAlign: "center",
    fontFamily: "Inter_500Medium",
  },
  placeholder: {
    width: 34, // Same width as the hamburger button to justify the text
  },
});

export default NavBarStyles;
