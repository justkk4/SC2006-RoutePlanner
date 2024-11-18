import React, { useState, useEffect } from "react";
import { View, Dimensions, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../../styles/NavBarStyles.js";
import SideDeck from "./SideDeck";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";

const { width } = Dimensions.get("window");
const SIDEBAR_WIDTH = (width * 2) / 3;

const NavBar = () => {
  const [isSideDeckVisible, setIsSideDeckVisible] = useState(false);
  const [name, setName] = useState("User");

  const toggleSideDeck = () => {
    setIsSideDeckVisible(!isSideDeckVisible);
  };

  // Function to load the JWT and extract the name
  const loadTokenAndExtractName = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      console.log("Token:", token);
      if (!token) {
        console.log("No access token found");
        return;
      }
      // Decode the JWT and extract the name (assuming the token contains a 'name' field)
      const decodedToken = jwtDecode(token);
      setName(decodedToken.name || "User"); // Fallback to "User" if no name is found
    } catch (error) {
      console.log("Error loading token:", error);
    }
  };

  // Use useEffect to call the async function after component mounts
  useEffect(() => {
    loadTokenAndExtractName();
  }, []); // Empty dependency array means it runs only once after mount

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.hamburgerButton}
          onPress={toggleSideDeck}
        >
          <Ionicons name="menu" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.welcomeText}>Welcome, {name}!</Text>
        <View style={styles.placeholder} />
      </View>
      <SideDeck isVisible={isSideDeckVisible} toggleSideDeck={toggleSideDeck} />
    </>
  );
};

export default NavBar;
