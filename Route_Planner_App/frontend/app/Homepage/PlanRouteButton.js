import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import styles from '../../styles/PlanRouteButtonStyles.js';

const PlanRouteButton = ({ onPress }) => {
    return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={styles.buttonText}>Plan{'\n'}Route</Text>
        </TouchableOpacity>
    );
};

export default PlanRouteButton;