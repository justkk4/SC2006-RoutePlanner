import React, { useEffect, useState } from "react";
import { TouchableOpacity, Text, View, Image, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import styles from "../../styles/DisplayHistoryStyles";
import { memo } from "react";

const DisplayHistory = ({ item }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const handlePress = () => {
    router.push({
      pathname: "../View_Run_History/RunSummary",
      params: {
        distance: item.distance,
        time: item.time,
        imageUrl: item.imageUrl,
      },
    });
  };

  useEffect(() => {
    if (item.imageUrl) {
      Image.prefetch(item.imageUrl);
    }
  }, [item.imageUrl]);

  return (
    <TouchableOpacity style={styles.item} onPress={handlePress}>
      <View style={styles.rowContainer}>
        <View style={styles.imageContainer}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#0000ff" />
            </View>
          )}
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.image}
            resizeMode="cover"
            onLoad={() => setLoading(false)}
            onError={() => setLoading(false)}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.text}>{item.date}</Text>
          <Text>
            <Text style={styles.data}>{item.distance}</Text>
            <Text style={styles.text}> km</Text>
          </Text>
          <Text>
            <Text style={styles.data}>{item.time}</Text>
            <Text style={styles.text}> time</Text>
          </Text>
          <Text>
            <Text style={styles.data}>{item.pace}</Text>
            <Text style={styles.text}> pace</Text>
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default memo(DisplayHistory);
