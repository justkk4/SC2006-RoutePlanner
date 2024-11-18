import { fetchWeatherData } from './FetchWeatherData';
import { fetchLocation } from './FetchLocation';

// Haversine formula to calculate the distance between two points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRadians = (degree) => (degree * Math.PI) / 180;
  const R = 6371; // Radius of Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

export const fetchUserWeather = async ( customLocation ) => {
  try {
    const data = await fetchWeatherData();
    const areaMetadata = data?.data?.area_metadata;

    if (!areaMetadata) {
      throw new Error('No area metadata available');
    }
    if (!customLocation) {
      location = await fetchLocation();
    }
    else{
      location = customLocation;
    }

    const { lat, lng } = location;
    let closestArea = null;
    let minDistance = Infinity;

    areaMetadata.forEach(area => {
      const areaLat = area.label_location.latitude;
      const areaLon = area.label_location.longitude;
      const distance = calculateDistance(lat, lng, areaLat, areaLon);
      // console.log('Distance to', area.name, ':', distance, 'km');

      if (distance < minDistance) {
        minDistance = distance;
        closestArea = area;
      }
    });

    const closestForecast = data?.data?.items[0]?.forecasts.find(
      forecast => forecast.area === closestArea.name
    );
    return {
      area: closestArea.name,
      forecast: closestForecast?.forecast || 'N/A'
    };
  } catch (error) {
    // console.error('Error fetching user weather:', error);
    return {
      area: 'Unknown',
      forecast: 'N/A'
    };
  }
};

