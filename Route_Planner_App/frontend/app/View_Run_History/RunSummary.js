import React, { useEffect, useRef, useState } from "react";
import { View, Text, Dimensions, TouchableOpacity, ImageBackground, ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import styles from "../../styles/RunSummaryStyles";
import { useFonts, Inter_100Thin } from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";

const { height } = Dimensions.get("window");

SplashScreen.preventAutoHideAsync(); // Prevent the splash screen from auto-hiding

const RunSummary = () => {
  const { distance, time, imageUrl } = useLocalSearchParams();
  const [fontsLoaded] = useFonts({
    Inter_100Thin,
  });
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync(); // Hide splash screen when fonts are loaded
    }
  }, [fontsLoaded]);

  const handleBackButton = () => {
    router.back(); // Instead of pushing to Homepage
  };

  const scrollRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ y: height * 0.27, animated: false });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.topHalf} 
        contentContainerStyle={styles.imageContainer}
        ref={scrollRef}
        horizontal={false}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          )}
          <ImageBackground
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="contain"
            onLoadEnd={() => setLoading(false)}
          />
        </View>
      </ScrollView>
      <View style={styles.bottomHalf} />
      <View style={styles.content}>
        <Text style={styles.title}>RUN SUMMARY</Text>
        <View>
          <Text style={styles.text}>Distance</Text>
          <View style={styles.dataRow}>
            <Text style={styles.data}>{distance}</Text>
            <Text style={styles.unit}>km</Text>
          </View>
        </View>
        <View>
          <Text style={styles.text}>Duration</Text>
          <Text style={styles.data}>{time}</Text>
          <Text style={styles.text}>Min:Sec</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleBackButton}>
        <Text style={styles.buttonText}>Back to Homepage</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RunSummary;
