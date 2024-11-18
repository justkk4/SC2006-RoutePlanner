import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Image, Modal, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapView, { Marker, Polyline, AnimatedRegion } from 'react-native-maps';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as Location from 'expo-location';
import { getDistance } from 'geolib';
import BackButton from '../BackButton';
import styles from '../../styles/StartRunStyles';

const StartRun = () => {
  const router = useRouter();
  const { routeCoordinates, instructions } = useLocalSearchParams();
  const parsedRouteCoordinates = JSON.parse(routeCoordinates);
  const startingPoint = parsedRouteCoordinates[0];
  
  const mapRef = useRef(null);
  const viewShotRef = useRef(null);
  
  const [isNearStart, setIsNearStart] = useState(false);
  const [showDistanceWarning, setShowDistanceWarning] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [heading, setHeading] = useState(0);
  const [isMapCentered, setIsMapCentered] = useState(true);

  // Initialize userCoordinate as an AnimatedRegion
  const userCoordinate = useRef(
      new AnimatedRegion({
          latitude: startingPoint.latitude,
          longitude: startingPoint.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
      })
  ).current;


  useEffect(() => {
    let locationSubscription;
    let headingSubscription;

    (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.error('Permission to access location was denied');
            return;
        }

        // Start watching position
        locationSubscription = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                timeInterval: 1000,
                distanceInterval: 1,
            },
            (newLocation) => {
                const { latitude, longitude } = newLocation.coords;
                setCurrentLocation(newLocation.coords);

                // Calculate distance to starting point
                const distanceToStart = getDistance(
                    { latitude, longitude },
                    { 
                        latitude: startingPoint.latitude, 
                        longitude: startingPoint.longitude 
                    }
                );

            
                setIsNearStart(distanceToStart <= 100);

                // Animate marker to new location
                userCoordinate.timing({
                    latitude,
                    longitude,
                    duration: 1000,
                }).start();
            }
        );

        // Start watching heading
        headingSubscription = await Location.watchHeadingAsync((headingData) => {
            setHeading(headingData.trueHeading || 0);
        });
    })();

    return () => {
        if (locationSubscription) {
            locationSubscription.remove();
        }
        if (headingSubscription) {
            headingSubscription.remove();
        }
    };
  }, []);

  useEffect(() => {
      if (isMapCentered && mapRef.current && parsedRouteCoordinates.length > 0) {
          mapRef.current.fitToCoordinates(parsedRouteCoordinates, {
              edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
              animated: true,
          });
          setIsMapCentered(false);
      }
  }, [isMapCentered, parsedRouteCoordinates]);

    const handleBackButton = () => {
        router.back();
    };

  const handleStartRun = async () => {
      if (!isNearStart) {
          setShowDistanceWarning(true);
          return;
      }

      try {
        if (mapRef.current && parsedRouteCoordinates.length > 0) {
          await new Promise((resolve) => {
              mapRef.current.fitToCoordinates(parsedRouteCoordinates, {
                  edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                  animated: true,
              });
              setTimeout(resolve, 500); 
          });
          console.log('Map centered');
        }

        // Capture the screenshot after the delay
        const uri = await captureRef(viewShotRef, {
            format: 'png',
            quality: 0.8,
            result: 'tmpfile',
        });
        console.log('Captured map screenshot:', uri);

        router.push({
            pathname: '../Navigation/NavigationPage',
            params: {
                routeImage: uri,
                routeCoordinates,
                instructions,
            },
        });
      } catch (error) {
          console.error('Failed to capture map screenshot', error);
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
    const pathVisits = getPathVisits(parsedRouteCoordinates);
    const distThreshold = 50;
    let cumulativeDistance = 0;
    const startColor = [0, 0, 255]; // Start with dark blue
    const endColor = [135, 206, 235]; // End with light sky blue

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
          ? "rgb(33, 200, 1)"  // Green arrows for single-pass paths (static)
          : showGreenArrows && direction === "forward"
          ? "rgb(33, 200, 1)"  // Toggle green arrows for repeated forward path
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
    for (let i = 1; i < parsedRouteCoordinates.length; i++) {
      const startCoord = parsedRouteCoordinates[i - 1];
      const endCoord = parsedRouteCoordinates[i];
      const bearing = calculateBearing(startCoord, endCoord);

      const segmentKey = `${startCoord.latitude},${startCoord.longitude}-${endCoord.latitude},${endCoord.longitude}`;
      const pathVisitInfo = pathVisits.get(segmentKey);

      const factor = i / parsedRouteCoordinates.length;
      renderGradientRoute(startCoord, endCoord, factor);

      // Render arrows based on segment visit count and direction
      renderArrows(startCoord, endCoord, bearing, segmentKey, pathVisitInfo);

      
    }

    return segments;
  };



  return (
    <View style={styles.container}>
        <ViewShot ref={viewShotRef} style={StyleSheet.absoluteFillObject} options={{ format: 'png', quality: 0.9 }}>
            <View style={styles.mapContainer}>
                <MapView
                    ref={mapRef}
                    style={StyleSheet.absoluteFillObject}
                    initialRegion={{
                        latitude: startingPoint.latitude,
                        longitude: startingPoint.longitude,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    }}
                >
                    {renderRoute()}
                    <Marker
                        coordinate={startingPoint}
                        anchor={{ x: 0.5, y: 1 }}
                    >
                        <Image
                            source={require('../../assets/Pin.webp')}
                            style={{ width: 40, height: 40 }}
                            resizeMode="contain"
                        />
                    </Marker>
                    <Marker.Animated
                        coordinate={userCoordinate}
                        anchor={{ x: 0.5, y: 0.5 }}
                        flat
                    >
                        <Image
                            source={require('../../assets/arrow.png')}
                            style={{
                                width: 40,
                                height: 40,
                                transform: [{ rotate: `${heading}deg` }],
                            }}
                        />
                    </Marker.Animated>
                </MapView>
            </View>
        </ViewShot>
        <BackButton onPress={handleBackButton} />
        <View style={styles.buttonContainer}>
            <Pressable 
                style={[
                    styles.startRunButton,
                    !isNearStart && styles.startRunButtonDisabled
                ]} 
                onPress={handleStartRun}
            >
                <Text style={styles.startRunButtonText}>Start Run</Text>
            </Pressable>
        </View>

        <Modal
            visible={showDistanceWarning}
            transparent={true}
            animationType="fade"
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalText}>
                        Please come closer to the start point
                    </Text>
                    <View style={styles.modalButtons}>
                        <Pressable
                            style={[styles.modalButton, styles.modalButtonPrimary]}
                            onPress={() => setShowDistanceWarning(false)}
                        >
                            <Text style={styles.modalButtonText}>Dismiss</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    </View>
);
};

export default StartRun;
