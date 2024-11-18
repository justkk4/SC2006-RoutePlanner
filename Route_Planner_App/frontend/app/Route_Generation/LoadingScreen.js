import { useRouter, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import React from 'react';
import LoadingScreenStyles from '../../styles/LoadingScreenStyles';
import LoadingSpinner from '../LoadingSpinner';

const LoadingScreen = () => {
    const router = useRouter();
    const { lng, lat, distance, landmarkLng, landmarkLat } = useLocalSearchParams();
    
    return (
        <View style={LoadingScreenStyles.container}>
            <LoadingSpinner text="Generating route" textColor="white" />
        </View>
    );
}

export default LoadingScreen;