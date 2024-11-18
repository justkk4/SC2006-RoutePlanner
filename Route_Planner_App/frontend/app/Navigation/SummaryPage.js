import React from 'react';
import { View, Text, Pressable, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapView, { Polyline } from 'react-native-maps';
import styles from '../../styles/SummaryPageStyles';

const SummaryPage = () => {
    const router = useRouter();
    const { distance, time, routeCoordinates } = useLocalSearchParams();
    const parsedRouteCoordinates = JSON.parse(routeCoordinates);

    const handleBackToHomepage = () => {
        router.push('/Homepage/Homepage');
    };

    const center = parsedRouteCoordinates.reduce(
        (acc, coord) => ({
            latitude: acc.latitude + coord.latitude / parsedRouteCoordinates.length,
            longitude: acc.longitude + coord.longitude / parsedRouteCoordinates.length,
        }),
        { latitude: 0, longitude: 0 }
    );

    const deltas = parsedRouteCoordinates.reduce(
        (acc, coord) => ({
            latDelta: Math.max(acc.latDelta, Math.abs(coord.latitude - center.latitude)),
            lngDelta: Math.max(acc.lngDelta, Math.abs(coord.longitude - center.longitude)),
        }),
        { latDelta: 0, lngDelta: 0 }
    );

    return (
        <SafeAreaView style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: center.latitude,
                    longitude: center.longitude,
                    latitudeDelta: deltas.latDelta * 3,
                    longitudeDelta: deltas.lngDelta * 3,
                }}
                showsUserLocation={false}
                showsCompass={true}
            >
                <Polyline
                    coordinates={parsedRouteCoordinates}
                    strokeWidth={4}
                    strokeColor="#0066FF"
                />
            </MapView>

            <View style={styles.whiteBackgroundCell} />

            <View style={styles.summaryCard}>
                <Text style={styles.title}>RUN SUMMARY</Text>
                
                <View style={styles.dataContainer}>
                    <View style={styles.dataSection}>
                        <Text style={styles.label}>DISTANCE</Text>
                        <View style={styles.valueContainer}>
                            <Text style={styles.value}>{distance}</Text>
                            <Text style={styles.unit}>km</Text>
                        </View>
                    </View>

                    <View style={styles.dataSection}>
                        <Text style={styles.label}>DURATION</Text>
                        <Text style={styles.value}>{time}</Text>
                        <Text style={styles.unitLabel}>Min:Sec</Text>
                    </View>
                </View>
            </View>

            <Pressable
                style={styles.button}
                onPress={handleBackToHomepage}
            >
                <Text style={styles.buttonText}>Back to{'\n'}homepage</Text>
            </Pressable>
        </SafeAreaView>
    );
};

export default SummaryPage;