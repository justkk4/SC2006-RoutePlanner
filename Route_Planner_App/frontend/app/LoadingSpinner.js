import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const LoadingSpinner = ({ text, textColor = 'white', size = 'large' }) => {
  return (
    <View style={styles.loadingContainer}>
      <Text style={[styles.loadingText, { color: textColor }]}>{text}</Text>
      <ActivityIndicator 
        size={size} 
        color={textColor}
        style={styles.spinner}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 4, 
  },
  loadingText: {
    fontSize: 30,
    fontFamily: 'Inter_500Medium',
    includeFontPadding: false,
    marginRight: -1, 
  },
  spinner: {
    marginLeft: 8, 
    transform: [{ scale: 1.0 }, { translateY: 4 }], 
  },
});

export default LoadingSpinner;