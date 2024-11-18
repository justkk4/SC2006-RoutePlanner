import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NavigationInstructions = ({ instruction, distance }) => {
  if (!instruction) return null;

  return (
      <View style={styles.container}>
          <View style={styles.card}>
              <Text style={styles.instructionText}>
                  {instruction.text || 'Continue straight'}
              </Text>
              {instruction.streetName && (
                  <Text style={styles.streetNameText}>
                      on {instruction.streetName}
                  </Text>
              )}
          </View>
          <View style={styles.distanceCard}>
              <Text style={styles.distanceText}>
                  <Text style={styles.distanceValue}>
                      {((distance || 0) / 1000).toFixed(1)}
                  </Text>
                  <Text style={styles.distanceUnit}>km</Text>
              </Text>
          </View>
      </View>
  );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 20,
        gap: 10
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    instructionText: {
        fontSize: 24,
        fontWeight: '600',
        color: '#33A001',
        textAlign: 'center'
    },
    distanceCard: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    distanceText: {
        textAlign: 'center',
    },
    distanceValue: {
        fontSize: 48,
        color: '#33A001',
        fontWeight: '700',
    },
    distanceUnit: {
        fontSize: 32,
        color: '#33A001',
        fontWeight: '500',
        marginLeft: 5
    },
});

export default NavigationInstructions;