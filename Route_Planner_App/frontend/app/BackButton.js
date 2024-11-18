import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import BackButtonStyles from '../styles/BackButtonStyles';

const BackButton = ({ onPress }) => {
    const router = useRouter();
    const text = "< Back";

    const handlePress = () => {
        if (onPress) {
            onPress();
        } else {
            router.back();
        }
    };

    return (
        <TouchableOpacity style={BackButtonStyles.button} onPress={handlePress}>
            <Text style={BackButtonStyles.buttonText}>{text}</Text>
        </TouchableOpacity>
    );
};

export default BackButton;