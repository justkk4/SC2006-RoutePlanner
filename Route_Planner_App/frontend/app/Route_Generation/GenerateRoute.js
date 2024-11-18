import {
  View,
  Text,
  Image,
  Pressable,
  Alert,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import React, { useState, useEffect, useRef } from "react";
import MapStyles from "../../styles/MapStyles.js";
import { useRouter, useLocalSearchParams } from "expo-router";
import graphHopperAPI_KEY from "../../API_KEYS/GraphHopperAPI_KEY.js";
import polyline from "@mapbox/polyline";
import BackButton from "../BackButton.js";
import RouteGenerationStyles from "../../styles/RouteGenerationStyles.js";
import LoadingSpinner from "../LoadingSpinner.js";
import axiosInstance from "../../utils/axiosInstance";
import * as SecureStore from "expo-secure-store";
import LoadingScreenStyles from "../../styles/LoadingScreenStyles.js";
import AnimatedToggle from "../AnimatedToggle";
import { getDistance } from "geolib";
import { Route } from "expo-router/build/Route.js";

const GenerateRoute = () => {
  const router = useRouter();

  const { lng, lat, distance, landmarkLng, landmarkLat, shelterStatus } =
    useLocalSearchParams();
  const LAT_PER_KM = 1 / 111.32;
  const LNG_PER_KM = 1 / (111.32 * Math.cos((lat / 180) * Math.PI));
  const [shelter, setShelter] = useState(shelterStatus == "true");
  const [routeNumber, setRouteNumber] = useState(1);
  const [routeGenerated, setRouteGenerated] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [coveredCoordinates, setCoveredCoordinates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [routeData, setRouteData] = useState(null);
  const [actualDistance, setActualDistance] = useState(0);
  const [coveredDistance, setCoveredDistance] = useState(0);
  const [token, setToken] = useState(null);
  const mapRef = useRef(null);
  const [isMapCentered, setIsMapCentered] = useState(true); // Track initial centering
  const [startMarker, setStartMarker] = useState([
    {
      id: 1,
      title: "Starting point",
      description: "This is where you begin your run!",
      coordinate: {
        latitude: lat,
        longitude: lng,
      },
    },
  ]);

  const [landmarkMarker, setLandmarkMarker] = useState([
    {
      id: 1,
      title: "Landmark",
      description: "This is where you want to run through!",
      coordinate: {
        latitude: landmarkLat,
        longitude: landmarkLng,
      },
    },
  ]);

    // Plot route line or update map view
    useEffect(() => {
      if (routeCoordinates.length && isMapCentered) {
        mapRef.current.fitToCoordinates(routeCoordinates[routeNumber - 1], {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
        setIsMapCentered(false); // Disable automatic centering after initial
      }
    }, [routeCoordinates, routeNumber, isMapCentered]);

  // Get the token from SecureStore
  useEffect(() => {
    const fetchToken = async () => {
      const tokenFetched = await SecureStore.getItemAsync("token");
      console.log("Token:", tokenFetched);
      if (!tokenFetched) {
        console.log("No access token found");
      }
      setToken(tokenFetched);
    };
    fetchToken();
  }, []);

  //Plot route line
  useEffect(() => {
    const fetchDataAsync = async () => {
      if (
        routeData &&
        routeData.length == 3 &&
        routeData[0].paths[0].points &&
        routeData[1].paths[0].points &&
        routeData[2].paths[0].points
      ) {
        let routeCoords = [];
        let coveredCoordsArray = [];
        let coveredDistanceArray = [];
        for (let j = 0; j < 3; j++) {
          let coveredDistance = 0;
          const decodedPolyline = polyline.decode(routeData[j].paths[0].points);
          console.log("Generated covered coordinate " + (j + 1));

          // Make a request with Authorization header
          const response = await axiosInstance.post(
            "/routes/intersections",
            {
              route: decodedPolyline, // Data goes here
            },
            {
              headers: {
                Authorization: `Bearer ${token}`, // Add the token to the Authorization header
              },
            }
          );

          const covered_array_size = response["data"].length;
          //console.log(response["data"]);
          let coveredRouteArray = [];
          for (let i = 0; i < covered_array_size; i++) {
            const coveredRoute = response["data"][i]["route"];
            const coveredRouteCoord = coveredRoute.map((point) => {
              return {
                latitude: point[0],
                longitude: point[1],
              };
            });
            coveredRouteArray.push(coveredRouteCoord);
            coveredDistance = coveredDistance + response["data"][i]["sheltered_distance"];
          }

          const routeCoord = decodedPolyline.map((point) => {
            return {
              latitude: point[0],
              longitude: point[1],
            };
          });

          routeCoords.push(routeCoord);
          coveredCoordsArray.push(coveredRouteArray);
          coveredDistanceArray.push(Math.floor(coveredDistance));
        }

        
        await setRouteCoordinates(routeCoords);
        await setCoveredCoordinates(coveredCoordsArray);
        setLoading(false);
        setRouteGenerated(true);
        setCoveredDistance(coveredDistanceArray);
      }
    };
    fetchDataAsync();
  }, [routeData]);

  const handleBackButton = async () => {
    if (routeGenerated || loading) {
      setRouteGenerated(false);
      setRouteData(null);
      setRouteCoordinates([]);
      setRouteNumber(1);
      setActualDistance([]);
      setCoveredCoordinates([]);
      setLoading(false);
      return;
    }

    router.back();
  };

  const handleSelectRoute = async () => {
    router.push({
      pathname: "./StartRun",
      params: {
        routeCoordinates: JSON.stringify(routeCoordinates[routeNumber - 1]),
        instructions: JSON.stringify(
          routeData[routeNumber - 1]?.paths[0]?.instructions || []
        ),
      },
    });
  };

  const handleToggleShelter = async () => {
    setShelter(!shelter);
  };

  const generateRoundTripRoute = async () => {
    try {
      setLoading(true);
      let data;
      let distances = [];
      let datas = [];
      for (let i = 0; i < 3; i++) {
        while (true) {
          let random_seed = Math.floor(Math.random() * 100);
          const query = new URLSearchParams({
            profile: "foot", // 'foot' for running
            "round_trip.distance": distance, // The distance in meters
            "round_trip.seed": random_seed, // Optional seed for generating different routes
            key: graphHopperAPI_KEY,
            algorithm: "round_trip",
          });
          let point_string = `${lat},${lng}`;
          query.append("point", point_string);

          const response = await fetch(
            `https://graphhopper.com/api/1/route?${query.toString()}`
          );
          data = await response.json();
          if (Math.abs(data.paths[0].distance - distance) < 500) {
            console.log("Generated route", i + 1);
            distances.push(data.paths[0].distance);
            datas.push(data);
            break;
          }
          
        }
      }
      setActualDistance(distances);
      setRouteData(datas);
    } catch (error) {
      console.error("Error generating route:", error);
      Alert.alert("Error", "Could not generate route");
      setLoading(false);
    }
  };

  // Function to calculate the distance between two coordinates in meters
  const calculateDistance = (coord1, coord2) => {
    const R = 6371000; // Radius of Earth in meters
    const lat1 = coord1.latitude * (Math.PI / 180); // Convert latitude to radians
    const lon1 = coord1.longitude * (Math.PI / 180); // Convert longitude to radians
    const lat2 = coord2.latitude * (Math.PI / 180); // Convert latitude to radians
    const lon2 = coord2.longitude * (Math.PI / 180); // Convert longitude to radians

    const deltaLat = lat2 - lat1;
    const deltaLon = lon2 - lon1;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in meters
    return distance;
  };

  const calculateBearing = (start, end) => {
    const lat1 = start.latitude * (Math.PI / 180); // Convert latitude to radians
    const lon1 = start.longitude * (Math.PI / 180); // Convert longitude to radians
    const lat2 = end.latitude * (Math.PI / 180); // Convert latitude to radians
    const lon2 = end.longitude * (Math.PI / 180); // Convert longitude to radians

    const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);

    const bearing = Math.atan2(y, x) * (180 / Math.PI); // Convert to degrees

    // Normalize to 0-360 degrees
    return (bearing + 360) % 360;
  };

  const interpolateColor = (startColor, endColor, factor) => {
    let result = startColor.slice();
    for (let i = 0; i < 3; i++) {
      result[i] = Math.round(
        result[i] + factor * (endColor[i] - startColor[i])
      );
    }
    return `rgb(${result[0]}, ${result[1]}, ${result[2]})`;
  };

  /* const renderGradientRoute = () => {
    const segments = [];
    const startColor = [0, 0, 255]; // Start with dark blue
    const endColor = [135, 206, 235]; // End with light sky blue

    for (let i = 1; i < routeCoordinates[routeNumber - 1].length; i++) {
      const factor = i / routeCoordinates[routeNumber - 1].length; // Calculate the progression factor
      const segmentColor = interpolateColor(startColor, endColor, factor); // Get interpolated color
      segments.push(
        <Polyline
          key={i}
          coordinates={[
            routeCoordinates[routeNumber - 1][i - 1],
            routeCoordinates[routeNumber - 1][i],
          ]}
          strokeWidth={5}
          strokeColor={segmentColor}
        />
      );
    }
    return segments;
  }; */

  // State to track arrow color toggle
  const [showGreenArrows, setShowGreenArrows] = useState(true);

  // Toggle the arrow color every second
  useEffect(() => {
    const interval = setInterval(() => {
      setShowGreenArrows(prev => !prev); // Toggle state
    }, 1000);

    return () => clearInterval(interval); // Clean up interval on component unmount
  }, []);

  // Calculate path visit counts to track repeated segments
  const getPathVisits = (coordinates) => {
    const pathVisits = new Map();

    for (let i = 1; i < coordinates.length; i++) {
      const startCoord = coordinates[i - 1];
      const endCoord = coordinates[i];
      const segmentKey = `${startCoord.latitude},${startCoord.longitude}-${endCoord.latitude},${endCoord.longitude}`;
      const reverseSegmentKey = `${endCoord.latitude},${endCoord.longitude}-${startCoord.latitude},${startCoord.longitude}`;

      // Increment visit count for the segment and reverse segment
      if (!pathVisits.has(segmentKey)) {
        pathVisits.set(segmentKey, { count: 1, direction: "forward" });
      } else {
        const count = pathVisits.get(segmentKey).count;
        pathVisits.set(segmentKey, { count: count + 1, direction: "forward" });
      }

      if (!pathVisits.has(reverseSegmentKey)) {
        pathVisits.set(reverseSegmentKey, { count: 1, direction: "reverse" });
      } else {
        const count = pathVisits.get(reverseSegmentKey).count;
        pathVisits.set(reverseSegmentKey, { count: count + 1, direction: "reverse" });
      }
    }

    return pathVisits;
  };

  // Function to render the route with static and toggling arrows
  const renderRoute = () => {
    const segments = [];
    const pathVisits = getPathVisits(routeCoordinates[routeNumber - 1]);
    const distThreshold = 80;
    let cumulativeDistance = 0;
    const startColor = [135, 106, 235]; // Start with dark blue
    const endColor = [135, 106, 235]; // End with light sky blue

    const renderArrows = (startCoord, endCoord, bearing, segmentKey, pathVisitInfo) => {
      const isRepeated = pathVisitInfo.count > 1;
      const direction = pathVisitInfo.direction;
      cumulativeDistance += calculateDistance(startCoord, endCoord);

      while (cumulativeDistance >= distThreshold) {
        const excessDistance = cumulativeDistance - distThreshold;
        const interpolationFactor = (calculateDistance(startCoord, endCoord) - excessDistance) / calculateDistance(startCoord, endCoord);

        const arrowPosition = {
          latitude: startCoord.latitude + interpolationFactor * (endCoord.latitude - startCoord.latitude),
          longitude: startCoord.longitude + interpolationFactor * (endCoord.longitude - startCoord.longitude),
        };

        // Determine arrow color based on `showGreenArrows`, visit count, and direction
        const arrowColor = !isRepeated
          ? "rgb(2, 166, 32)"  // Green arrows for single-pass paths (static)
          : showGreenArrows && direction === "forward"
            ? "rgb(2, 166, 32)"  // Toggle green arrows for repeated forward path
          : !showGreenArrows && direction === "reverse"
          ? "rgb(200, 0, 0)"  // Toggle red arrows for repeated reverse path
          : null;

        if (arrowColor) {
          segments.push(
            <Marker
              key={`arrow-${startCoord.latitude}-${startCoord.longitude}-${cumulativeDistance}-${direction}`}
              coordinate={arrowPosition}
              anchor={{ x: 0.5, y: 0.5 }}
              flat
            >
              <Image
                source={require('../../assets/routeArrow.png')}
                style={{
                  width: 13,
                  height: 13,
                  tintColor: arrowColor,
                  transform: [{ rotate: `${bearing}deg` }]
                }}
              />
            </Marker>
          );
        }
        cumulativeDistance -= distThreshold;
      }
    };

    const renderGradientRoute = (startCoord, endCoord, factor) => {
      const segmentColor = interpolateColor(startColor, endColor, factor);
      segments.push(
        <Polyline
          key={`polyline-${startCoord.latitude}-${startCoord.longitude}-${endCoord.latitude}-${endCoord.longitude}`}
          coordinates={[startCoord, endCoord]}
          strokeWidth={5}
          strokeColor={segmentColor}
        />
      );
    };

    // Render route with segments and arrows
    for (let i = 1; i < routeCoordinates[routeNumber - 1].length; i++) {
      const startCoord = routeCoordinates[routeNumber - 1][i - 1];
      const endCoord = routeCoordinates[routeNumber - 1][i];
      const bearing = calculateBearing(startCoord, endCoord);

      const segmentKey = `${startCoord.latitude},${startCoord.longitude}-${endCoord.latitude},${endCoord.longitude}`;
      const pathVisitInfo = pathVisits.get(segmentKey);

      const factor = i / routeCoordinates[routeNumber - 1].length;
      //renderGradientRoute(startCoord, endCoord, factor);

      // Render arrows based on segment visit count and direction
      renderArrows(startCoord, endCoord, bearing, segmentKey, pathVisitInfo);

      
    }

    return segments;
  };




  const generateLandmarkRoute = async () => {
    console.log("generating landmark route");
    try {
      setLoading(true);
      let distances = [];
      let datas = [];
      const query = new URLSearchParams({
        profile: "foot",
        key: graphHopperAPI_KEY,
      });
      let point_string = `${lat},${lng}`;
      query.append("point", point_string);
      query.append("point", `${landmarkLat},${landmarkLng}`);
      const response1 = await fetch(
        `https://graphhopper.com/api/1/route?${query.toString()}`
      );
      data1 = await response1.json();
      const remaining_distance = distance - data1.paths[0].distance;
      console.log("Remaining distance: ", remaining_distance);

      if (remaining_distance < distance / 2) {
        for (let i = 0; i < 3; i++) {
          const final_query = new URLSearchParams({
            profile: "foot",
            key: graphHopperAPI_KEY,
          });
          let point_string = `${lat},${lng}`;
          final_query.append("point", point_string);
          final_query.append("point", `${landmarkLat},${landmarkLng}`);
          final_query.append("point", point_string);
          const response2 = await fetch(
            `https://graphhopper.com/api/1/route?${final_query.toString()}`
          );
          data2 = await response2.json();
          distances.push(data2.paths[0].distance);
          datas.push(data2);
        }
      } else {
        const midpointLat = (parseFloat(landmarkLat) + parseFloat(lat)) / 2;
        const midpointLng = (parseFloat(landmarkLng) + parseFloat(lng)) / 2;
        let intermediateLat;
        let intermediateLng;
        for (let i = 0; i < 3; i++) {
          let lat_weight = Math.floor(Math.random() * 100) - 50;
          let lng_weight = Math.floor(Math.random() * 100) - 50;
          intermediateLat =
            midpointLat +
            (((lat_weight / 50) * remaining_distance) / 2000) * LAT_PER_KM;
          intermediateLng =
            midpointLng +
            (((lng_weight / 50) * remaining_distance) / 2000) * LNG_PER_KM;
          let count = 0;
          while (true) {
            if (count > 20) {
              lat_weight = Math.floor(Math.random() * 100) - 50;
              lng_weight = Math.floor(Math.random() * 100) - 50;
              intermediateLat =
                midpointLat +
                (((lat_weight / 50) * remaining_distance) / 2000) * LAT_PER_KM;
              intermediateLng =
                midpointLng +
                (((lng_weight / 50) * remaining_distance) / 2000) * LNG_PER_KM;
              count = 0;
            }
            console.log("Intermediate lat: ", intermediateLat);
            console.log("Intermediate Lng: ", intermediateLng);
            const final_query = new URLSearchParams({
              profile: "foot",
              key: graphHopperAPI_KEY,
            });
            let point_string = `${lat},${lng}`;
            final_query.append("point", `${landmarkLat},${landmarkLng}`);
            final_query.append(
              "point",
              `${intermediateLat.toString()},${intermediateLng.toString()}`
            );
            final_query.append("point", point_string);
            const response2 = await fetch(
              `https://graphhopper.com/api/1/route?${final_query.toString()}`
            );
            data2 = await response2.json();
            let return_distance = data2?.paths?.[0]?.distance;
            console.log(return_distance);
            if (return_distance == undefined) {
              lat_weight = Math.floor(Math.random() * 100) - 50;
              lng_weight = Math.floor(Math.random() * 100) - 50;
              intermediateLat =
                midpointLat +
                (((lat_weight / 50) * remaining_distance) / 2000) * LAT_PER_KM;
              intermediateLng =
                midpointLng +
                (((lng_weight / 50) * remaining_distance) / 2000) * LNG_PER_KM;
              count = 0;
              continue;
            }
            if (Math.abs(return_distance - remaining_distance) < 500) {
              const final_query = new URLSearchParams({
                profile: "foot",
                key: graphHopperAPI_KEY,
              });
              let point_string = `${lat},${lng}`;
              final_query.append("point", point_string);
              final_query.append("point", `${landmarkLat},${landmarkLng}`);
              final_query.append(
                "point",
                `${intermediateLat.toString()},${intermediateLng.toString()}`
              );
              final_query.append("point", point_string);
              console.log("Pushed route ", i + 1);
              const response2 = await fetch(
                `https://graphhopper.com/api/1/route?${final_query.toString()}`
              );
              data2 = await response2.json();
              distances.push(data2.paths[0].distance);
              datas.push(data2);
              break;
            } else {
              let intermediate_minus_mid_lat = intermediateLat - midpointLat;
              let intermediate_minus_mid_lng = intermediateLng - midpointLng;
              if (return_distance > remaining_distance) {
                intermediateLat =
                  intermediateLat -
                  (Math.random() / 5) * intermediate_minus_mid_lat;
                intermediateLng =
                  intermediateLng -
                  (Math.random() / 5) * intermediate_minus_mid_lng;
              } else {
                intermediateLat =
                  intermediateLat +
                  (Math.random() / 5) * intermediate_minus_mid_lat;
                intermediateLng =
                  intermediateLng +
                  (Math.random() / 5) * intermediate_minus_mid_lng;
              }
              count++;
            }
          }
        }
      }
      setActualDistance(distances);
      setRouteData(datas);
    } catch (error) {
      console.error("Error generating route:", error);
      Alert.alert("Error", "Could not generate route");
      setLoading(false);
    }
  };

  const generateShelteredLandmarkRoute = async () => {
    try {
      setLoading(true);
      let data;
      let distances = [];
      let datas = [];

      let bufferDistance = parseInt(distance) / 2;
      let coveredCoord4DArray = [];
      let remaining_distance;
      const query = new URLSearchParams({
        key: graphHopperAPI_KEY,
      });
      while (true){
        try {
          coveredCoord4DArray = [];
          const responseShelter = await axiosInstance.post(
            "/routes/nearby-shelters",
            {
              bufferDistance: bufferDistance,
              point: [lat, lng],
            },
            {
              headers: {
                Authorization: `Bearer ${token}`, // Add the token to the Authorization header
              },
            }
          );
          const coveredSize = responseShelter["data"].length;
          for (let i = 0; i < coveredSize; i++) {
            if (responseShelter["data"][i]["coveredlinkway"]["type"] == "Polygon") {
              const coordCovered = responseShelter["data"][i]["coveredlinkway"]["coordinates"];
              coveredCoord4DArray.push(coordCovered);
            }
          }

          const response = await fetch(
            `https://graphhopper.com/api/1/route?${query.toString()}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                profile: "foot",
                points: [[lng, lat], [landmarkLng, landmarkLat]],
                'ch.disable': true,
                "custom_model": {
                  "priority": [
                    {
                      "if": "in_sheltered_area",
                      "multiply_by": "1.0",
                    },
                    {
                      "else": "",
                      "multiply_by": "0.1",
                    },
                  ],
                  "areas": {
                    "type": "FeatureCollection",
                    "features": [
                      {
                        "type": "Feature",
                        "id": "sheltered_area",
                        "properties": {},
                        "geometry": {
                          "type": "MultiPolygon",
                          "coordinates": coveredCoord4DArray,
                        },
                      },
                    ],
                  },
                },
              }),
            }
          );
          data = await response.json();
          remaining_distance = distance - data.paths[0].distance;
          console.log("Remaining distance: ", remaining_distance);
          break;
        }
        catch (error){
          bufferDistance = bufferDistance * 0.85;
          console.log("New buffer distance: ", bufferDistance);
        }
      }
      if (remaining_distance < distance / 2) {
        for (let i = 0; i < 3; i++) {
          const response = await fetch(
            `https://graphhopper.com/api/1/route?${query.toString()}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                profile: "foot",
                points: [[lng, lat], [landmarkLng, landmarkLat], [lng, lat]],
                'ch.disable': true,
                "custom_model": {
                  "priority": [
                    {
                      "if": "in_sheltered_area",
                      "multiply_by": "1.0",
                    },
                    {
                      "else": "",
                      "multiply_by": "0.1",
                    },
                  ],
                  "areas": {
                    "type": "FeatureCollection",
                    "features": [
                      {
                        "type": "Feature",
                        "id": "sheltered_area",
                        "properties": {},
                        "geometry": {
                          "type": "MultiPolygon",
                          "coordinates": coveredCoord4DArray,
                        },
                      },
                    ],
                  },
                },
              }),
            }
          );
          data = await response.json();
          distances.push(data.paths[0].distance);
          datas.push(data);
        }
      }
      else {
        const midpointLat = (parseFloat(landmarkLat) + parseFloat(lat)) / 2;
        const midpointLng = (parseFloat(landmarkLng) + parseFloat(lng)) / 2;
        let intermediateLat;
        let intermediateLng;
        for (let i = 0; i < 3; i++) {
          let lat_weight = Math.floor(Math.random() * 100) - 50;
          let lng_weight = Math.floor(Math.random() * 100) - 50;
          intermediateLat =
            midpointLat +
            (((lat_weight / 50) * remaining_distance) / 2000) * LAT_PER_KM;
          intermediateLng =
            midpointLng +
            (((lng_weight / 50) * remaining_distance) / 2000) * LNG_PER_KM;
          let count = 0;
          while (true) {
            if (count > 20) {
              lat_weight = Math.floor(Math.random() * 100) - 50;
              lng_weight = Math.floor(Math.random() * 100) - 50;
              intermediateLat =
                midpointLat +
                (((lat_weight / 50) * remaining_distance) / 2000) * LAT_PER_KM;
              intermediateLng =
                midpointLng +
                (((lng_weight / 50) * remaining_distance) / 2000) * LNG_PER_KM;
              count = 0;
            }
            console.log("Intermediate lat: ", intermediateLat);
            console.log("Intermediate Lng: ", intermediateLng);
            const response = await fetch(
              `https://graphhopper.com/api/1/route?${query.toString()}`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  profile: "foot",
                  points: [[landmarkLng, landmarkLat], [intermediateLng, intermediateLat], [lng, lat]],
                  'ch.disable': true,
                  "custom_model": {
                    "priority": [
                      {
                        "if": "in_sheltered_area",
                        "multiply_by": "1.0",
                      },
                      {
                        "else": "",
                        "multiply_by": "0.1",
                      },
                    ],
                    "areas": {
                      "type": "FeatureCollection",
                      "features": [
                        {
                          "type": "Feature",
                          "id": "sheltered_area",
                          "properties": {},
                          "geometry": {
                            "type": "MultiPolygon",
                            "coordinates": coveredCoord4DArray,
                          },
                        },
                      ],
                    },
                  },
                }),
              }
            );
            data = await response.json();
            let return_distance = data?.paths?.[0]?.distance;
            console.log(return_distance);
            if (return_distance == undefined) {
              lat_weight = Math.floor(Math.random() * 100) - 50;
              lng_weight = Math.floor(Math.random() * 100) - 50;
              intermediateLat =
                midpointLat +
                (((lat_weight / 50) * remaining_distance) / 2000) * LAT_PER_KM;
              intermediateLng =
                midpointLng +
                (((lng_weight / 50) * remaining_distance) / 2000) * LNG_PER_KM;
              count = 0;
              continue;
            }
            if (Math.abs(return_distance - remaining_distance) < 500) {
              const response = await fetch(
                `https://graphhopper.com/api/1/route?${query.toString()}`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    profile: "foot",
                    points: [[lng, lat], [landmarkLng, landmarkLat], [intermediateLng, intermediateLat], [lng, lat]],
                    'ch.disable': true,
                    "custom_model": {
                      "priority": [
                        {
                          "if": "in_sheltered_area",
                          "multiply_by": "1.0",
                        },
                        {
                          "else": "",
                          "multiply_by": "0.1",
                        },
                      ],
                      "areas": {
                        "type": "FeatureCollection",
                        "features": [
                          {
                            "type": "Feature",
                            "id": "sheltered_area",
                            "properties": {},
                            "geometry": {
                              "type": "MultiPolygon",
                              "coordinates": coveredCoord4DArray,
                            },
                          },
                        ],
                      },
                    },
                  }),
                }
              );
              data = await response.json();
              console.log("Generated route ", i + 1);
              distances.push(data.paths[0].distance);
              datas.push(data);
              break;
            } else {
              let intermediate_minus_mid_lat = intermediateLat - midpointLat;
              let intermediate_minus_mid_lng = intermediateLng - midpointLng;
              if (return_distance > remaining_distance) {
                intermediateLat =
                  intermediateLat -
                  (Math.random() / 5) * intermediate_minus_mid_lat;
                intermediateLng =
                  intermediateLng -
                  (Math.random() / 5) * intermediate_minus_mid_lng;
              } else {
                intermediateLat =
                  intermediateLat +
                  (Math.random() / 5) * intermediate_minus_mid_lat;
                intermediateLng =
                  intermediateLng +
                  (Math.random() / 5) * intermediate_minus_mid_lng;
              }
              count++;
            }
          }
        }
      }

      setActualDistance(distances);
      setRouteData(datas);
    } catch (error) {
      console.error("Error generating route:", error);
      Alert.alert("Error", "Could not generate route");
      setLoading(false);
    }
  };

  const generateShelteredRoundTripRoute = async () => {
    try {
      setLoading(true);
      let data;
      let distances = [];
      let datas = [];
      let coveredDistanceArray = [];
      let coveredDistance;
      let smallest_index = 0;

      let bufferDistance = parseInt(distance) / 2;
      let coveredCoord4DArray = []
      const response = await axiosInstance.post(
        "/routes/nearby-shelters",
        {
          bufferDistance: bufferDistance,
          point: [lat, lng],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add the token to the Authorization header
          },
        }
      );
      const coveredSize = response["data"].length;
      for (let i = 0; i < coveredSize; i++) {
        if (response["data"][i]["coveredlinkway"]["type"] == "Polygon") {
          const coordCovered = response["data"][i]["coveredlinkway"]["coordinates"];
          coveredCoord4DArray.push(coordCovered);
        }
      }
      
      for (let i = 0; i < 10; i++) {
        while (true) {
          try {
            let random_seed = Math.floor(Math.random() * 100);
            const query = new URLSearchParams({
              key: graphHopperAPI_KEY,
            });

            const response = await fetch(
              `https://graphhopper.com/api/1/route?${query.toString()}`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  profile: "foot",
                  points: [[lng, lat]],
                  'ch.disable': true,
                  algorithm: "round_trip",
                  "round_trip.distance": parseInt(distance),
                  "round_trip.seed": random_seed,
                  "custom_model": {
                    "priority": [
                      {
                        "if": "in_sheltered_area",
                        "multiply_by": "1.0",
                      },
                      {
                        "else": "",
                        "multiply_by": "0.1",
                      },
                    ],
                    "areas": {
                      "type": "FeatureCollection",
                      "features": [
                        {
                          "type": "Feature",
                          "id": "sheltered_area",
                          "properties": {},
                          "geometry": {
                            "type": "MultiPolygon",
                            "coordinates": coveredCoord4DArray,
                          },
                        },
                      ],
                    },
                  },
                }),
              }
            );
            data = await response.json();
            console.log(data["paths"][0]["weight"]);
            if (Math.abs(data.paths[0].distance - distance) < 500) {
              console.log("Found route ", i + 1);
              break;
            }
          }
          catch (error) {
            console.log("Reducing buffer distance by 15%");
            coveredCoord4DArray = [];
            bufferDistance = bufferDistance * 0.85;
            console.log("New buffer distance: ", bufferDistance);
            if (bufferDistance < 500) {
              console.log("Throwing error");
              throw (Error);
            }
            const response = await axiosInstance.post(
              "/routes/nearby-shelters",
              {
                bufferDistance: bufferDistance,
                point: [lat, lng],
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`, // Add the token to the Authorization header
                },
              }
            );
            const coveredSize = response["data"].length;
            for (let i = 0; i < coveredSize; i++) {
              if (response["data"][i]["coveredlinkway"]["type"] == "Polygon") {
                const coordCovered = response["data"][i]["coveredlinkway"]["coordinates"];
                coveredCoord4DArray.push(coordCovered);
              }
              else{
                const multipolygonLength = response["data"][i]["coveredlinkway"]["coordinates"].length;
                for (let j = 0; j < multipolygonLength; j++){
                  const coordCovered = response["data"][i]["coveredlinkway"]["coordinates"][j];
                  coveredCoord4DArray.push(coordCovered);
                }
              }
            }
            //console.log(coveredCoord4DArray);
          }
        }
        const decodedPolyline = polyline.decode(data.paths[0].points);
        const response = await axiosInstance.post(
          "/routes/intersections",
          {
            route: decodedPolyline, // Data goes here
          },
          {
            headers: {
              Authorization: `Bearer ${token}`, // Add the token to the Authorization header
            },
          }
        );
        const covered_array_size = response["data"].length;
        coveredDistance = 0;
        for (let i = 0; i < covered_array_size; i++) {
          coveredDistance = coveredDistance + response["data"][i]["sheltered_distance"];
        }
        if (distances.length != 3){
          distances.push(data.paths[0].distance);
          datas.push(data);
          coveredDistanceArray.push(coveredDistance);
        }
        else {
          smallest_index = 0;
          for (let k = 1; k < 3; k++){
            if (coveredDistanceArray[k] < coveredDistanceArray[smallest_index]){
              smallest_index = k;
            }
          }
          if (coveredDistanceArray[smallest_index] < coveredDistance){
            let replace = true;
            for (let j = 0; j < 3; j++){
              if (coveredDistanceArray[j] == coveredDistance){
                replace = false;
                break;
              }
            }
            if (replace){
              coveredDistanceArray[smallest_index] = coveredDistance;
              datas[smallest_index] = data;
              distances[smallest_index] = data.paths[0].distance;
            }
            
          }
        }
        console.log(coveredDistanceArray);
      }
      setActualDistance(distances);
      setRouteData(datas);
    } catch (error) {
      console.error("Error generating route:", error);
      Alert.alert("Error", "Could not generate route");
      setLoading(false);
    }
  };

  const handleGenerateRoute = async () => {
    if (landmarkLat == null || landmarkLng == null) {
      if (shelter == true) {
        console.log("Generating sheltered round trip");
        generateShelteredRoundTripRoute();
      } else {
        generateRoundTripRoute();
      }
    } else {
      if (shelter == true) {
        console.log("Generating sheltered landmark route");
        generateShelteredLandmarkRoute();
      } else {
        generateLandmarkRoute();
      }
    }
  };

  return (
    <View style={RouteGenerationStyles.container}>
      <View style={MapStyles.container}>
        <MapView
          ref={mapRef}
          style={MapStyles.map}
          initialRegion={{
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          zoomEnabled={true}
          scrollEnabled={true}
        >
          {routeCoordinates.length == 3 && renderRoute()}

          {routeCoordinates.length == 3 &&
            <Polyline
              coordinates={routeCoordinates[routeNumber - 1]}
              strokeColor="#000"  // Customize color
              strokeWidth={7}     // Customize width
            />
          }

          {routeCoordinates.length == 3 && 
            <Polyline
              coordinates={routeCoordinates[routeNumber - 1]}
            strokeColor="#00F"  // Customize color
              strokeWidth={5}     // Customize width
            />
          }

          {coveredCoordinates.length == 3 && routeNumber == 1 && coveredCoordinates[0].map((route, index) => (
            <Polyline
              key={index}
              coordinates={route}
              strokeColor="#ffef0d"  // Customize color
              strokeWidth={5}     // Customize width
            />
          ))}

          {coveredCoordinates.length == 3 && routeNumber == 2 && coveredCoordinates[1].map((route, index) => (
            <Polyline
              key={index}
              coordinates={route}
              strokeColor="#ffef0d"  // Customize color
              strokeWidth={5}     // Customize width
            />
          ))}

          {coveredCoordinates.length == 3 && routeNumber == 3 && coveredCoordinates[2].map((route, index) => (
            <Polyline
              key={index}
              coordinates={route}
              strokeColor="#ffef0d"  // Customize color
              strokeWidth={5}     // Customize width
            />
          ))}

          {startMarker.map((marker) => (
            <Marker
              key={marker.id}
              coordinate={marker.coordinate}
              title={marker.title}
              description={marker.description}
            >
              <Image
                source={require("../../assets/Pin.webp")}
                style={{ width: 50, height: 50 }}
                resizeMode="contain"
              />
            </Marker>
          ))}
          {landmarkMarker.map((marker) => (
            <Marker
              key={marker.id}
              coordinate={marker.coordinate}
              title={marker.title}
              description={marker.description}
            >
              <Image
                source={require("../../assets/landmarkPin.png")}
                style={{ width: 50, height: 50 }}
                resizeMode="contain"
              />
            </Marker>
          ))}
        </MapView>
        <BackButton onPress={handleBackButton} />
        {routeGenerated ? (
          <View style={RouteGenerationStyles.routeNumberRow}>
            {routeNumber == 1 ? (
              <Pressable
                onPress={() => {
                  setRouteNumber(1);
                  setIsMapCentered(true);
                }}
                style={[
                  RouteGenerationStyles.routeNumberButton,
                  { backgroundColor: "#39B500" },
                ]}
              >
                <Text
                  style={[
                    RouteGenerationStyles.routeNumberText,
                    { color: "white" },
                  ]}
                >
                  1
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => {
                  setRouteNumber(1);
                  setIsMapCentered(true);
                }}
                style={RouteGenerationStyles.routeNumberButton}
              >
                <Text style={RouteGenerationStyles.routeNumberText}>1</Text>
              </Pressable>
            )}
            {routeNumber == 2 ? (
              <Pressable
                onPress={() => {
                  setRouteNumber(2);
                  setIsMapCentered(true);
                }}
                style={[
                  RouteGenerationStyles.routeNumberButton,
                  { backgroundColor: "#39B500" },
                ]}
              >
                <Text
                  style={[
                    RouteGenerationStyles.routeNumberText,
                    { color: "white" },
                  ]}
                >
                  2
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => {
                  setRouteNumber(2);
                  setIsMapCentered(true);
                }}
                style={RouteGenerationStyles.routeNumberButton}
              >
                <Text style={RouteGenerationStyles.routeNumberText}>2</Text>
              </Pressable>
            )}
            {routeNumber == 3 ? (
              <Pressable
                onPress={() => {
                  setRouteNumber(3);
                  setIsMapCentered(true);
                }}
                style={[
                  RouteGenerationStyles.routeNumberButton,
                  { backgroundColor: "#39B500" },
                ]}
              >
                <Text
                  style={[
                    RouteGenerationStyles.routeNumberText,
                    { color: "white" },
                  ]}
                >
                  3
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => {
                  setRouteNumber(3);
                  setIsMapCentered(true);
                }}
                style={RouteGenerationStyles.routeNumberButton}
              >
                <Text style={RouteGenerationStyles.routeNumberText}>3</Text>
              </Pressable>
            )}
          </View>
        ) : null}
      </View>
      {routeGenerated ? (
        <View
          style={[
            RouteGenerationStyles.formContainer,
            { backgroundColor: "white", paddingBottom: 30, paddingTop: 10,
              position: 'absolute', flex: 0.35, width: '100%',
              height: '25%'
             },
          ]}
        >
          <Text style={RouteGenerationStyles.fontText}>
            Select 1 of the 3 options
          </Text>
          <Text
            style={[
              RouteGenerationStyles.fontText,
              { fontSize: 30, color: "#33A001", paddingBottom: 10 },
            ]}
          >
            Route successfully generated!
          </Text>
          <Pressable
            style={RouteGenerationStyles.selectRouteButton}
            onPress={handleSelectRoute}
          >
            <Text
              style={[
                RouteGenerationStyles.buttonText,
                { fontSize: 40, lineHeight: 38, fontStyle: "italic", fontWeight: 'bold' },
              ]}
            >
              Select route
            </Text>
          </Pressable>
        </View>
      ) : (
        <View
          style={[
            RouteGenerationStyles.formContainer,
            { backgroundColor: "white", paddingVertical: 50 },
          ]}
        >
          <Pressable
            style={RouteGenerationStyles.generateRouteButton}
            onPress={handleGenerateRoute}
          >
            <Text
              style={[
                RouteGenerationStyles.buttonText,
                { fontSize: 35, lineHeight: 38, fontStyle: "italic", fontWeight: 'bold' },
              ]}
            >
              Generate route
            </Text>
          </Pressable>
        </View>
      )}
      {loading ? (
    <View style={LoadingScreenStyles.container}>
        <LoadingSpinner text="Generating route" textColor="white" />
    </View>
) : null}
      {routeGenerated ? (
        <View style={RouteGenerationStyles.distanceDisplayContainter}>
          <Text style={RouteGenerationStyles.distanceText}>Distance:</Text>
          <Text
            style={[
              RouteGenerationStyles.distanceText,
              { fontSize: 30, fontStyle: "italic" },
            ]}
          >
            {Math.floor(actualDistance[routeNumber - 1] / 100) / 10}km
          </Text>
        </View>
      ) : null}
      {loading || routeGenerated ? null : (
        <View style={RouteGenerationStyles.toggleShelterContainer}>
          <Text style={RouteGenerationStyles.text}>
            Look for sheltered route
          </Text>
          <AnimatedToggle isEnabled={shelter} onToggle={handleToggleShelter} />
        </View>
      )}
      {routeGenerated ? (<View style={RouteGenerationStyles.shelteredLegend}>
        <Text style={{ color: '#1D5A00', fontSize: 12, marginRight: '6%', fontWeight: 'bold', marginVertical: '1%' }}>Sheltered Distance: {coveredDistance[routeNumber - 1]}m</Text>
        <View style={{ flexDirection: 'row', marginVertical: '1%' }}>
          <Text style={{ color: '#1D5A00', fontSize: 12 }}>Sheltered pathway</Text>
          <View style={{ width: '25%', borderBottomWidth: 3, borderColor: '#ffef0d', marginHorizontal: '5%' }}></View>
        </View>
        <View style={{flexDirection: 'row', marginVertical: '1%'}}>
          <Text style={{color: '#1D5A00', fontSize: 12}}>Unsheltered pathway</Text>
          <View style={{width: '25%', borderBottomWidth: 3, borderColor: '#0000FF', marginHorizontal: '5%'}}></View>
        </View>
      </View>) : null}
    </View>
  );
};

export default GenerateRoute;
