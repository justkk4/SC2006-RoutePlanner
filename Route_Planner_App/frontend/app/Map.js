import React, { useState, useEffect, useRef } from 'react';
import { View, Alert, Image, Linking } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import MapStyles from '../styles/MapStyles';

const Map = ({ customLocation }) => {
    const [location, setLocation] = useState(null); // User's current location
    const [region, setRegion] = useState(null);
    const mapRef = useRef(null);
    const locationSubscription = useRef(null);
    const initialZoom = {
        latitudeDelta: 0.004,
        longitudeDelta: 0.004,
    };

    useEffect(() => {
        // console.log("Custom location:", customLocation);
        if (customLocation) {
            // console.log("Setting custom location");
            if (locationSubscription.current) {
                locationSubscription.current.remove();
                locationSubscription.current = null;
            }

            const { latitude, longitude } = customLocation;
            const newRegion = {
                latitude,
                longitude,
                ...initialZoom,
            };
            setRegion(newRegion);

            if (mapRef.current) {
                mapRef.current.animateToRegion(newRegion, 1000);
                // console.log("Animating to custom location:", newRegion);
            }
        } else {
            // Otherwise, request the user's current location
            // console.log("Requesting user's current location");
            let permissionInterval;
            (async () => {
                const checkLocationPermission = async () => {
                    let { status } = await Location.requestForegroundPermissionsAsync();
                    if (status != 'granted') {
                        Alert.alert(
                            'Location Permission Required',
                            'Please enable location permissions in settings to use this app.',
                            [
                                {
                                    text: 'Settings',
                                    onPress: () => Linking.openURL('app-settings:'),
                                },
                            ],
                            { cancelable: false }
                        );
                    }
                };
                await checkLocationPermission();

                locationSubscription.current = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.High,
                        timeInterval: 1000,
                        distanceInterval: 10,
                    },
                    (newLocation) => {
                        setLocation(newLocation);

                        // If no custom location, keep centering the map on the user's current location
                        if (!customLocation) {
                            setRegion({
                                latitude: newLocation.coords.latitude,
                                longitude: newLocation.coords.longitude,
                                ...initialZoom,
                            });

                            if (mapRef.current) {
                                mapRef.current.animateToRegion({
                                    latitude: newLocation.coords.latitude,
                                    longitude: newLocation.coords.longitude,
                                    ...initialZoom,
                                }, 1000);
                            }
                        }
                    }
                );
            })();
        }

        // Cleanup the location subscription when the component unmounts
        return () => {
            if (locationSubscription.current) {
                locationSubscription.current.remove();
            }
        };
    }, [customLocation]);

    const handleCirclePress = () => {
        const targetLocation = customLocation || location;
        if (targetLocation && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: targetLocation.latitude || targetLocation.coords.latitude,
                longitude: targetLocation.longitude || targetLocation.coords.longitude,
                ...initialZoom,
            }, 1000);
        }
    };

    return (
        <View style={MapStyles.mapContainer}>
            {region && (
                <MapView
                    ref={mapRef}
                    style={MapStyles.map}
                    initialRegion={region}
                    onRegionChangeComplete={(newRegion) => {
                        setRegion(newRegion); // Track region but don't control map movement
                        // console.log("Region changed:", newRegion);
                    }}
                >
                    {(customLocation || location) && (
                        <Marker
                            coordinate={{
                                latitude: customLocation?.latitude || location?.coords.latitude,
                                longitude: customLocation?.longitude || location?.coords.longitude,
                            }}
                            onPress={handleCirclePress}
                        >
                            <Image
                                source={require('../assets/Pin.webp')}
                                style={{ width: 50, height: 50 }}
                                resizeMode="contain"
                            />
                        </Marker>
                    )}
                </MapView>
            )}
        </View>
    );
};

export default Map;