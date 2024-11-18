import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  InteractionManager,
} from "react-native";
import { useRouter } from "expo-router";
import DisplayHistory from "./DisplayHistory";
import styles from "../../styles/RunHistoryPageStyles";
import LoadingScreenStyles from "../../styles/LoadingScreenStyles";
import LoadingSpinner from "../LoadingSpinner";
import {
  useFonts,
  Inter_500Medium,
  Inter_300Light,
} from "@expo-google-fonts/inter";
import {
  InterTight_700Bold_Italic
} from "@expo-google-fonts/inter-tight"
import BackButton from "../BackButton.js";
import axiosInstance from "../../utils/axiosInstance";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync(); // Prevent the splash screen from auto-hiding
const RunHistoryPage = () => {
  const [runHistory, setRunHistory] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_500Medium,
    InterTight_700Bold_Italic
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync(); // Hide splash screen when fonts are loaded
    }
  }, [fontsLoaded]);

  const fetchRunHistory = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      console.log("Token:", token);
      if (!token) {
        console.log("No access token found");
        return;
      }

      // Make a request with Authorization header
      const response = await axiosInstance.get("/runs", {
        headers: {
          Authorization: `Bearer ${token}`, // Add the token to the Authorization header
        },
      });

      const runHistory = response.data
        .map((run) => {
        return {
          id: run.id,
          date: run.date,
          distance: run.distance,
          time: run.time,
          pace: run.pace,
          imageUrl: run.signedUrl,
        };
      })
      .reverse();

      setRunHistory(runHistory);
    } catch (error) {
      console.error("Error fetching run history:", error);
    } finally {
      InteractionManager.runAfterInteractions(() => {
        setLoading(false);
      });
    }
  };

  React.useEffect(() => {
    fetchRunHistory();
  }, []);

  const handleBackButton = async () => {
    router.back(); // Instead of pushing to Homepage
  };

  if (loading) {
    return (
      <View style={LoadingScreenStyles.container}>
        <LoadingSpinner text="Loading History" textColor="white" />
        <BackButton onPress={handleBackButton} />
      </View>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topHalf} />
      <BackButton onPress={handleBackButton} style={styles.backButton} />
      <View style={styles.bottomHalf} />
      <View style={styles.content}>
        <View style={styles.runHistoryContainer}>
          <Text style={styles.title}>RUN HISTORY</Text>
          <FlatList
            data={runHistory}
            renderItem={({ item }) => <DisplayHistory item={item} />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default RunHistoryPage;
