import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, ActivityIndicator } from 'react-native';
import { fetchWeatherData } from './FetchWeatherData';
import { fetchLocation } from './FetchLocation'

const WeatherForecast = () => {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);

  const fetchData = () => {
    setLoading(true);
    fetchWeatherData()
      .then(data => {
        setForecast(data);
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
      });
    fetchLocation()
      .then(loc => {
        console.log(loc);
        setLocation(loc);
      }) 
  };

  useEffect(() => {
    fetchData(); 

    const interval = setInterval(() => {
      fetchData();
    }, 30 * 60 * 1000); 

    return () => {
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <SafeAreaView>
      {forecast ? (
        forecast.data.items.map((item, index) => (
          <View key={index}>
            <Text>Updated: {item.valid_period.text}</Text>
            {item.forecasts.map((areaForecast, idx) => (
              <Text key={idx}>
                {areaForecast.area}: {areaForecast.forecast}
              </Text>
            ))}
          </View>
        ))
      ) : (
        <Text>No forecast data available.</Text>
      )}
    </SafeAreaView>
  );
};

export default WeatherForecast;