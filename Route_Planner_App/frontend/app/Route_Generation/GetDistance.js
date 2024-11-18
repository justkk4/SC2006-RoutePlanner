import React, { useState } from "react";
import {
  Pressable,
  View,
  Text,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Map from "../Map.js";
import BackButton from "../BackButton.js";
import RouteGenerationStyles from "../../styles/RouteGenerationStyles.js";
import AnimatedToggle from "../AnimatedToggle";

const GetDistance = () => {
  const router = useRouter();
  const { lat, lng, shelterStatus } = useLocalSearchParams();
  // console.log("Starting GetDistance.js");
  // console.log('Lat: ', lat);
  // console.log('Lng: ', lng);
  const [shelter, setShelter] = useState(shelterStatus == "true");
  const [distance, setDistance] = useState("");

  const geocodeAddress = async () => {
    try {
      if (isNaN(distance) || Number(distance) < 1 || Number(distance) > 30) {
        Alert.alert(
          "Error",
          "Please key in a valid distance between 1km and 30km"
        );
      } else {
        router.push({
          pathname: "./GetLandmark",
          params: {
            lat: lat,
            lng: lng,
            distance: Math.floor(Number(distance) * 1000),
            shelterStatus: shelter,
          },
        });
      }
    } catch (error) {
      console.error("Error entering distance:", error);
      Alert.alert("Error", "Could not enter distance");
    }
  };

  const handleBackButton = async () => {
    router.back();
  };

  const handleToggleShelter = async () => {
    setShelter(!shelter);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={RouteGenerationStyles.container}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="always"
      >
        <View style={RouteGenerationStyles.mapContainer}>
          <Map customLocation={{ latitude: lat, longitude: lng }} />
          <BackButton onPress={handleBackButton} />
        </View>
        <View style={RouteGenerationStyles.formContainer}>
          <Text
            style={[
              RouteGenerationStyles.text,
              { fontSize: 20, marginBottom: 10, fontWeight: "bold" },
            ]}
          >
            Enter distance
          </Text>
          <View
            style={[
              RouteGenerationStyles.distanceInputContainer,
              {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              },
            ]}
          >
            <TextInput
              style={[RouteGenerationStyles.text, { fontSize: 20 }]}
              placeholder="0"
              value={distance}
              onChangeText={(text) => setDistance(text)}
            />
            <View style={{ justifyContent: "flex-end" }}>
              <Text style={[RouteGenerationStyles.text, { fontSize: 20 }]}>
                km
              </Text>
            </View>
          </View>

          <Pressable
            style={RouteGenerationStyles.button}
            onPress={geocodeAddress}
          >
            <Text style={RouteGenerationStyles.buttonText}>Next</Text>
          </Pressable>
        </View>
        <View style={RouteGenerationStyles.toggleShelterContainer}>
          <Text style={RouteGenerationStyles.text}>
            Look for sheltered route
          </Text>
          <AnimatedToggle isEnabled={shelter} onToggle={handleToggleShelter} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default GetDistance;
