import React, { useState } from "react";
import {
  Alert,
  Pressable,
  TouchableWithoutFeedback,
  Text,
  TextInput,
  View,
  Keyboard
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import styles from "../../styles/RegisterStyles";
import { SplashScreen, useRouter } from "expo-router";
import {
  useFonts,
  Inter_700Bold,
  Inter_300Light,
} from "@expo-google-fonts/inter";
import { Syne_500Medium } from "@expo-google-fonts/syne";
import axiosInstance from "../../utils/axiosInstance";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync(); // Prevent the splash screen from auto-hiding
const Register = ({ navigation }) => {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Syne_500Medium,
    Inter_300Light,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync(); // Hide splash screen when fonts are loaded
    }
  }, [fontsLoaded]);

  //useFonts({ Inter_700Bold, Syne_500Medium, Inter_300Light });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLoginPress = () => {
    router.push({
      pathname: "./Login",
    });
  };

  const handleRegisterPress = async () => {
    try {
      // Send a POST request to the backend
      const response = await axiosInstance.post("/auth/register", {
        name: displayName,
        username: username,
        password: password,
      });
      console.log("Registration Success");

      Alert.alert("Success", response.data.message);
      router.push({
        pathname: "./Login",
      });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(error.response.data.message);
        if (error.response.data.message === "Username already exists") {
          Alert.alert("Registration Error", "Username already exists");
        } else
          Alert.alert(
            "Registration Error",
            error.response.data.message[0].charAt(0).toUpperCase() +
              error.response.data.message[0].slice(1)
          );
      } else {
        console.log(error);
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.container}>
      {/* Green Background Top Half */}
      <View style={styles.topHalf} />

      {/* White Background Bottom Half */}
      <View style={styles.bottomHalf}></View>

      {/* Login Form */}
      <View style={styles.formView}>
        <View style={styles.inputView}>
          <Text style={styles.title}>CREATE ACCOUNT</Text>

          <Text style={styles.inputHeader}>Display Name</Text>
          <TextInput
            style={styles.inputField}
            placeholder="User"
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="none"
            autoCorrect={false}
          />

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
          <Pressable onPress={() => setPasswordVisible(!passwordVisible)}>
            <Icon
              name={passwordVisible ? "eye" : "eye-off"}
              size={24}
              color="gray"
              style={styles.eyeIcon}
            />
          </Pressable>
        </View>

        {/* Register Button */}
        <View style={styles.buttonView}>
          <Pressable
            style={styles.buttonRegister}
            onPress={handleRegisterPress}
          >
            <Text style={styles.buttonRegisterText}>Register</Text>
          </Pressable>
        </View>

        {/* Sign In Row */}
        <View style={styles.signBox}>
          <Text
            style={{
              flex: 3,
              fontSize: 18,
              textAlign: "center",
              paddingRight: 10,
              color: "white",
              fontFamily: "Syne_500Medium",
            }}
          >
            Already registered?
          </Text>
          <Pressable style={styles.buttonSign} onPress={handleLoginPress}>
            <Text style={styles.buttonSignText}>Sign in</Text>
          </Pressable>
        </View>
      </View>
    </View>
    </TouchableWithoutFeedback>
  );
};

export default Register;
