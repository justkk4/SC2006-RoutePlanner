import React, { useEffect } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import PlanRouteButton from "./PlanRouteButton";
import NavBar from "./NavBar";
import HomepageStyles from "../../styles/HomepageStyles";
import Map from "../Map";
import { useFonts, Inter_500Medium } from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync(); // Prevent the splash screen from auto-hiding
const Homepage = () => {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    Inter_500Medium,
  });
  //useFonts({ Inter });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync(); // Hide splash screen when fonts are loaded
    }
  }, [fontsLoaded]);

  const handlePlanRoutePress = () => {
    router.push({
      pathname: "../Route_Generation/GetStartAddress",
    });
  };

  if (!fontsLoaded) {
    return null; // Don't render anything until the fonts are loaded
  }
  return (
    <View style={HomepageStyles.container}>
      <NavBar />
      <Map></Map>
      <View style={HomepageStyles.buttonContainer}>
        <PlanRouteButton onPress={handlePlanRoutePress} />
      </View>
    </View>
  );
};

export default Homepage;
