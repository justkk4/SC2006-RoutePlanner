import * as Location from 'expo-location';

export async function fetchLocation() {
    try {
        // Request permission to access location
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.error('Permission to access location was denied');
            return null;
        }

        // Get the current location
        let location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });
        
        // Return location in dictionary form
        return {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
            // altitude: location.coords.altitude,
            // accuracy: location.coords.accuracy,
            // timestamp: location.timestamp
        };
    } catch (error) {
        console.error('Error fetching location:', error);
        return null;
    }
}