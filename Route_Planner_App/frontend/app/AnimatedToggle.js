import React, { useEffect, useRef } from 'react';
import { View, Pressable, Animated, StyleSheet } from 'react-native';

const AnimatedToggle = ({ isEnabled, onToggle }) => {
    const toggleAnimation = useRef(new Animated.Value(isEnabled ? 1 : 0)).current;

    useEffect(() => {
        Animated.spring(toggleAnimation, {
            toValue: isEnabled ? 1 : 0,
            useNativeDriver: false,
            bounciness: 2,
            speed: 12
        }).start();
    }, [isEnabled]);

    const backgroundColorInterpolate = toggleAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['#D3D3D3', '#58D41F'] 
    });

    const circleTranslateX = toggleAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 24] 
    });

    const circleBackgroundColor = toggleAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['#FFFFFF', '#FFFFFF']
    });

    return (
        <Pressable onPress={onToggle} style={styles.container}>
            <Animated.View 
                style={[
                    styles.track,
                    {
                        backgroundColor: backgroundColorInterpolate
                    }
                ]}
            >
                <Animated.View 
                    style={[
                        styles.circle,
                        {
                            transform: [{
                                translateX: circleTranslateX
                            }],
                            backgroundColor: circleBackgroundColor
                        }
                    ]}
                />
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        marginLeft: 10,
        justifyContent: 'center',
        height: 40,
    },
    track: {
        width: 48,
        height: 24,
        borderRadius: 12,
        padding: 2,
    },
    circle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 3,
    }
});

export default AnimatedToggle;