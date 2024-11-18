export const fetchWeatherData = async (date = new Date().toISOString().split('T')[0]) => {
    const url = `https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast?date=${date}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      // console.error('Error fetching data:', error);
      throw error;
    }
  };