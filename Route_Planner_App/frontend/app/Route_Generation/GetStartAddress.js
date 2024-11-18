import React, { useState, useEffect } from "react";
import { Pressable, View, Text, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import GMapsAPI_KEY from "../../API_KEYS/GMapsAPI_KEY.js";
import Map from "../Map.js";
import BackButton from "../BackButton.js";
import RouteGenerationStyles from "../../styles/RouteGenerationStyles.js";
import { fetchUserWeather } from "../Weather/FetchUserWeather";
import AnimatedToggle from "../AnimatedToggle";
import axiosInstance from "../../utils/axiosInstance";
import HereAPI_KEY from "../../API_KEYS/HereAPI_KEY.js";
import { Route } from "expo-router/build/Route.js";
import { fetchLocation } from "../Weather/FetchLocation.js";
import { WeatherWidget } from "../Weather/WeatherWidget.js";

const determineDefaultToggle = async ({ customLocation }) => {
  let forecast;
  try {
    // If customLocation is null, handle it accordingly
    if (customLocation) {
      forecast = await fetchUserWeather(customLocation);
    } else {
      const currentLocation = await fetchLocation();
      forecast = await fetchUserWeather(currentLocation);
    }
    // console.log("Weather forecast:", forecast);
    const condition = forecast?.forecast?.toLowerCase();

    // Check conditions for determining the toggle state
    if (condition.includes("rain") || condition.includes("showers")) return true;
    if (
      condition.includes("hazy") ||
      condition.includes("mist") ||
      condition.includes("fog")
    )
      return true;

    return false;
  } catch (error) {
    console.error("Error determining toggle state:", error);
    return false; // Default value in case of an error
  }
};

const PlanRoute = () => {
  const router = useRouter();
  const { shelterStatus } = useLocalSearchParams();
  const [startAddress, setStartAddress] = useState("");
  const [shelter, setShelter] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [latLong, setLatLong] = useState(null);

  useEffect(() => {
    const fetchToggleStatus = async () => {
      try {
        const status = await determineDefaultToggle({customLocation: latLong});
        setShelter(status);
      } catch (error) {
        console.log("Error fetching toggle status:", error);
        console.log("If the above error occurs only once, it's okay.")
      }
    };

    // Choice permanence when back button is pressed
    if (shelterStatus == undefined) {
      fetchToggleStatus();
    } else {
      setShelter(shelterStatus == "true");
    }
  }, [latLong]);

  const geocodeAddress = async () => {
    try {
      let locationData;
      if (startAddress === "Current Location" || startAddress === "") {
        // Fetch current location
        locationData = await fetchLocation();
      } 
      else {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            startAddress
          )}&components=country:SG&key=${GMapsAPI_KEY}`
        );
        const data = await response.json();

        if (data.status === "OK") {
          locationData = data.results[0].geometry.location;
        } else {
          Alert.alert(
            "Geocoding Error",
            data.error_message || "Failed to fetch location"
          );
          return;
        }
      }

      // Update the destination location state
      setLatLong({
        lat: locationData.lat,
        lng: locationData.lng,
      });
    } catch (error) {
      console.error("Error fetching geocode:", error);
      Alert.alert("Error", "Could not fetch geolocation");
    }
  };

  const handleNext = async () => {
    router.push({
      pathname: "./GetDistance",
      params: {
        lat: latLong.lat,
        lng: latLong.lng,
        shelterStatus: shelter,
      },
    });
  };

  const handleBackButton = async () => {
    router.back();
  };

  const handleToggleShelter = async () => {
    setShelter(!shelter);
  };

  const handleSelection = (value) => {
    setStartAddress(value);
    setShowDropdown(false);
  };

  async function getAutoSuggestions(query) {
    try {
      const response = await axiosInstance.get(
        `https://autosuggest.search.hereapi.com/v1/autosuggest`,
        {
          params: {
            q: query,
            at: "1.290270,103.851959", // example coordinates (Singapore)
            apiKey: HereAPI_KEY,
            limit: 5,
            resultType: "place",
          },
        }
      );

      const suggestions = response.data.items.map((item) => item.title);
      setSuggestions(suggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  }

  useEffect(() => {
    if (showDropdown && startAddress && startAddress.trim() !== "") {
      getAutoSuggestions(startAddress);
    } else {
      setShowDropdown(false);
    }
  }, [startAddress]);

  useEffect(() => {
    if (!showDropdown) {
      geocodeAddress();
    }
  }, [showDropdown]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={RouteGenerationStyles.container}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="always">
        <TouchableWithoutFeedback onPress={() => {setShowDropdown(false); Keyboard.dismiss()}}>
          <View style={RouteGenerationStyles.mapContainer}>
            {latLong? (
              <Map customLocation={{latitude: latLong?.lat, longitude: latLong?.lng}}/>
            ): (
              <Map/>
            )}
            {latLong && (
              <WeatherWidget customLocation={{lat: latLong?.lat, lng: latLong?.lng}}/>
            )}
            <BackButton onPress={handleBackButton} />
          </View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={() => {setShowDropdown(false); Keyboard.dismiss()}}>
        <View style={RouteGenerationStyles.toggleShelterContainer}>
          <Text style={RouteGenerationStyles.text}>Look for sheltered route</Text>
          <AnimatedToggle isEnabled={shelter} onToggle={handleToggleShelter} />
        </View>
        </TouchableWithoutFeedback>

        <View style={RouteGenerationStyles.formContainer}>
          <Text
            style={[
              RouteGenerationStyles.text,
              { marginBottom: 10, fontSize: 20 },
            ]}
          >
            Set a{" "}
            <Text
              style={[
                RouteGenerationStyles.text,
                { marginBottom: 10, fontWeight: "bold", fontSize: 20 },
              ]}
            >
              starting point
            </Text>{" "}
          </Text>

          {showDropdown && (
            <View style={RouteGenerationStyles.dropdownListContainer}>
              <ScrollView
                style={[RouteGenerationStyles.dropdownList, { bottom: 1, width: '100%' }]}
                keyboardShouldPersistTaps="always"
              >
                <Pressable
                  onPress={() => handleSelection("Current Location")}
                  style={RouteGenerationStyles.dropdownItem}
                >
                  <Text style={[RouteGenerationStyles.dropdownItemText, { fontWeight: 'bold' }]}>Current Location</Text>
                </Pressable>
                {suggestions.map((suggestion, index) => (
                  <Pressable
                    key={index}
                    onPress={() => handleSelection(suggestion)}
                    style={RouteGenerationStyles.dropdownItem}
                  >
                    <Text style={RouteGenerationStyles.dropdownItemText}>{suggestion}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          <TextInput
            style={RouteGenerationStyles.input}
            placeholder="Current Location"
            placeholderTextColor={"gray"}
            value={startAddress}
            onChangeText={(text) => {
              setStartAddress(text);
              setShowDropdown(true);
            }}
          /> 

          <Pressable
            style={RouteGenerationStyles.button}
            onPress={handleNext}
          >
            <Text style={RouteGenerationStyles.buttonText}>Next</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default PlanRoute;