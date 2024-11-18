import React, { useRef, useEffect, useState } from 'react';
import { View, Animated, TouchableWithoutFeedback, Dimensions, Image, TouchableOpacity, Text } from 'react-native';
import styles from '../../styles/SideDeckStyles';
import { useRouter } from 'expo-router';

const logo = require("../../assets/RoutePlanner2.png");
const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 2 / 3;

const SideDeck = ({ isVisible, toggleSideDeck }) =>  {
  const router = useRouter();
  const translateX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const [isRendered, setIsRendered] = useState(isVisible);

  const handleSignOutPress = () => {
    router.push({
      pathname: '../Login/Login',
    })
  }

  const handleViewRunHistory = () => {
    router.push('../View_Run_History/RunHistoryPage');
    toggleSideDeck();
  };

  useEffect(() => {
    if (isVisible) {
      setIsRendered(true);
    }
    Animated.timing(translateX, {
      toValue: isVisible ? 0 : -SIDEBAR_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (!isVisible) {
        setIsRendered(false);
      }
    });
  }, [isVisible]);

  if (!isRendered) return null;

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={()=>{toggleSideDeck()}}>
        <Animated.View 
          style={[
            styles.overlay,
            {
              opacity: translateX.interpolate({
                inputRange: [-SIDEBAR_WIDTH, 0],
                outputRange: [0, 1],
              }),
            },
          ]}
        />
      </TouchableWithoutFeedback>
      <Animated.View
        style={[
          styles.sidebar, 
          { 
            transform: [{ translateX }],
            width: SIDEBAR_WIDTH 
          }
        ]}
      >
        <View style={styles.sidebarContent}>
          <Image 
            source={logo} 
            style={styles.routePlannerImage}
            resizeMode="contain"
          />
          <View style={styles.separator} />
          <TouchableOpacity style={styles.button} onPress={handleViewRunHistory}>
            <Text style={styles.buttonText}>View Run History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleSignOutPress}>
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

export default SideDeck;