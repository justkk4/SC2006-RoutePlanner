import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { weatherWidgetStyles } from '../../styles/WeatherWidget.styles';
import { fetchUserWeather } from './FetchUserWeather';

const getWeatherIcon = (forecast) => {
  const condition = forecast?.toLowerCase();
  if (condition.includes('thunder')) return 'weather-lightning';
  if (condition.includes('rain') || condition.includes('showers')) return 'weather-rainy';
  if (condition.includes('hazy') || condition.includes('mist') || condition.includes('fog')) return 'weather-hazy';
  if (condition.includes('partly')) return 'weather-partly-cloudy';
  if (condition.includes('fair')) return 'weather-sunny';
  if (condition.includes('windy')) return 'weather-windy';
  return 'weather-cloudy';
};

export const WeatherWidget = ({ customLocation }) => {
  const [weather, setWeather] = useState({ area: 'Unknown', forecast: 'N/A' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // console.log(customLocation);
    if(customLocation){
      const fetchData = async () => {
        setLoading(true);
        const userWeather = await fetchUserWeather(customLocation);
        setWeather(userWeather);
        setLoading(false);
      };

      fetchData();
      const interval = setInterval(fetchData, 1 * 1000);
      return () => clearInterval(interval);
    }
  }, [customLocation]);

  // if (loading) {
  //   return (
  //     <View style={weatherWidgetStyles.container}>
  //       <Text>Loading...</Text>
  //     </View>
  //   );
  // }

  return (
    <View style={weatherWidgetStyles.container}>
      <MaterialCommunityIcons
        name={getWeatherIcon(weather.forecast)}
        size={32}
        color="#FFFFFF"
      />
      <Text style={weatherWidgetStyles.forecast}>{weather.forecast}</Text>
      <Text style={weatherWidgetStyles.area}>{weather.area}</Text>
    </View>
  );
};
