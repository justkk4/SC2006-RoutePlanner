import React, { useState, useEffect } from "react";
import {
  Alert,
  Image,
  Pressable,
  TouchableWithoutFeedback,
  Text,
  TextInput,
  View,
  Keyboard
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import styles from "../../styles/LoginStyles";
import { useRouter } from "expo-router";

const logo = require("../../assets/RoutePlanner.png");
import {
  useFonts,
  Inter_700Bold,
  Inter_300Light,
} from "@expo-google-fonts/inter";
import { Syne_500Medium } from "@expo-google-fonts/syne";
import * as SplashScreen from "expo-splash-screen";
import axiosInstance from "../../utils/axiosInstance";
import * as SecureStore from "expo-secure-store";

SplashScreen.preventAutoHideAsync(); // Prevent the splash screen from auto-hiding

const Login = () => {
  const router = useRouter();

  // Load fonts using useFonts hook
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_300Light,
    Syne_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync(); // Hide splash screen when fonts are loaded
    }
  }, [fontsLoaded]);

  //useFonts({ Inter_700Bold, Syne_500Medium, Inter_300Light });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegisterPress = () => {
    router.push({
      pathname: "./Register",
    });
  };

  const handleLoginPress = async () => {
    try {
      // Send a POST request to the backend
      const response = await axiosInstance.post("/auth/login", {
        username: username,
        password: password,
      });

      console.log("Login Success");

      await SecureStore.setItemAsync("token", response.data.access_token);
      router.push({
        pathname: "../Homepage/Homepage",
      });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(error.response.data.message);
        Alert.alert(
          "Login Error",
          error.response.data.message[0].charAt(0).toUpperCase() +
            error.response.data.message[0].slice(1)
        );
      } else if (error.response && error.response.status === 401) {
        console.log(error.response.data.message);
        Alert.alert("Login Error", error.response.data.message);
      } else {
        console.log(error);
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
    }
  };

  if (!fontsLoaded) {
    return null; // Don't render anything until the fonts are loaded
  }

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    <View style={styles.container}>
      {/* Green Background Top Half */}
      <View style={styles.topHalf}>
        <Image source={logo} style={styles.image} resizeMode="contain" />
      </View>

      {/* White Background Bottom Half */}
      <View style={styles.bottomHalf}></View>

      {/* Login Form */}
      <View style={styles.formView}>
        <View style={styles.inputView}>
          <Text style={styles.title}>Login</Text>

          {/* Username Field */}
          <Text style={styles.inputHeader}>Username</Text>
          <TextInput
            style={styles.inputField}
            placeholder="username123"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Password Field */}
          <Text style={styles.inputHeader}>Password</Text>
          <TextInput
            style={styles.inputField}
            placeholder="********"
            secureTextEntry={!passwordVisible}
            value={password}
            onChangeText={setPassword}
          />
          {/* Password Eye Icon */}
          <Pressable onPress={() => setPasswordVisible(!passwordVisible)}>
            <Icon
              name={passwordVisible ? "eye" : "eye-off"}
              size={24}
              color="gray"
              style={styles.eyeIcon}
            />
          </Pressable>
        </View>

        {/* Sign-in and Register Buttons */}
        <View style={styles.buttonView}>
          <Pressable style={styles.buttonSign} onPress={handleLoginPress}>
            <Text style={styles.buttonSignText}>SIGN IN</Text>
          </Pressable>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ flex: 1, height: 1, backgroundColor: "#133B00" }} />
            <View>
              <Text
                style={{
                  paddingHorizontal: 10,
                  textAlign: "center",
                  fontFamily: "Inter_300Light",
                  color: "white",
                  fontSize: 18,
                }}
              >
                OR
              </Text>
            </View>
            <View style={{ flex: 1, height: 1, backgroundColor: "#133B00" }} />
          </View>

          <Pressable
            style={styles.buttonRegister}
            onPress={handleRegisterPress}
          >
            <Text style={styles.buttonRegisterText}>REGISTER</Text>
          </Pressable>
        </View>
      </View>
    </View>
    </TouchableWithoutFeedback>
  );
};

export default Login;
