import React, { useState, useEffect, useCallback } from 'react';
import { Pressable, View, Text, TextInput, Alert, KeyboardAvoidingView, ScrollView, Platform, TouchableWithoutFeedback } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import Map from '../Map';
import BackButton from '../BackButton';
import LoadingSpinner from '../LoadingSpinner';
import RouteGenerationStyles from '../../styles/RouteGenerationStyles';
import LoadingScreenStyles from '../../styles/LoadingScreenStyles';
import OneMapsAPI_KEY from '../../API_KEYS/OneMapsAPI_KEY';
import graphHopperAPI_KEY from '../../API_KEYS/GraphHopperAPI_KEY';
import AnimatedToggle from '../AnimatedToggle';
import { fetchLocation } from '../Weather/FetchLocation';

const GetLandmark = () => {
    const router = useRouter();
    const [position, setPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const { lng, lat, distance, shelterStatus } = useLocalSearchParams();
    const LAT_PER_KM = 1/111.32;
    const LNG_PER_KM = 1 / (111.32 * Math.cos(lat / 180 * Math.PI));
    const upper_lat = String(lat - (-distance / 2000 * LAT_PER_KM));
    const lower_lat = String(lat - (distance / 2000 * LAT_PER_KM));
    const right_lng = String(lng - (-distance / 2000 * LNG_PER_KM));
    const left_lng = String(lng - (distance / 2000 * LNG_PER_KM));
    const [shelter, setShelter] = useState((shelterStatus == "true"));
    const [dropdownChoice, setDropdownChoice] = useState('None');
    const [showDropdown, setShowDropdown] = useState(false);
    const [landmarkLat, setLandmarkLat] = useState(null);
    const [landmarkLng, setLandmarkLng] = useState(null);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);

    const handleLayout = (event) => {
        const { x, y, width, height } = event.nativeEvent.layout;
        setPosition({ x, y, width, height });
    };

    const fetchTourismLandmarks = async () => {
        try {
            const xhr = new XMLHttpRequest();
    
            xhr.addEventListener("readystatechange", async function () {
                if (this.readyState === this.DONE) {
                    const response = JSON.parse(this.responseText);
                    const landmarks_array = [];
                    let length = response["SrchResults"].length;
                    for (let i = 1; i < length; i++){
                        let name = response["SrchResults"][i]["NAME"];
                        let latResponse = response["SrchResults"][i]["LATITUDE"];
                        let lngResponse = response["SrchResults"][i]["LONGTITUDE"];
                        if (!landmarks_array.some(item => item.label === name)){
                            const query = new URLSearchParams({
                                profile: "foot",
                                key: graphHopperAPI_KEY,
                            });
                            let point_string = `${lat},${lng}`;
                            query.append("point", point_string);
                            query.append('point', `${latResponse},${lngResponse}`);
                            const response = await fetch(
                                `https://graphhopper.com/api/1/route?${query.toString()}`
                            );
                            const data = await response.json();
                            const travel_distance = data?.paths?.[0]?.distance;
                            if (travel_distance !== undefined && travel_distance <= distance / 2) {
                                landmarks_array.push({
                                    label: name,
                                    value: name,
                                    lat: latResponse,
                                    lng: lngResponse,
                                });
                            }
                        }
                    }
                    if (landmarks_array.length > 0) {
                        setCategories(prevCategories => [
                            ...prevCategories.filter(cat => cat.name !== 'Tourist Attractions'),
                            {
                                name: 'Tourist Attractions',
                                landmarks: landmarks_array,
                            }
                        ]);
                    }
                }
            });
    
            const encodedExtents = `${lower_lat},${left_lng},${upper_lat},${right_lng}`;
            const url = `https://www.onemap.gov.sg/api/public/themesvc/retrieveTheme?queryName=tourism&extents=${encodedExtents}`;
            xhr.open("GET", url);
            xhr.setRequestHeader("Authorization", OneMapsAPI_KEY);
            xhr.send();
        } catch (error) {
            //console.error("Error fetching landmarks:", error);
        }
    };

    const fetchCategoricalLandmarks = async (categoryName, queryName) => {
        try {
            const xhr = new XMLHttpRequest();
    
            xhr.addEventListener("readystatechange", async function () {
                if (this.readyState === this.DONE) {
                    const response = JSON.parse(this.responseText);
                    const landmarks_array = [];
                    let length = response["SrchResults"].length;
                    for (let i = 1; i < length; i++) {
                        let name = response["SrchResults"][i]["NAME"].split(" ")
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                            .join(" ");
                        let lat_lng = response["SrchResults"][i]["LatLng"];
                        let [latResponse, lngResponse] = lat_lng.split(',');
                        if (!landmarks_array.some(item => item.label === name)) {
                            const query = new URLSearchParams({
                                profile: "foot",
                                key: graphHopperAPI_KEY,
                            });
                            let point_string = `${lat},${lng}`;
                            query.append("point", point_string);
                            query.append('point', `${latResponse},${lngResponse}`);
                            const response = await fetch(
                                `https://graphhopper.com/api/1/route?${query.toString()}`
                            );
                            const data = await response.json();
                            const travel_distance = data?.paths?.[0]?.distance;
                            if (travel_distance !== undefined && travel_distance <= distance / 2) {
                                landmarks_array.push({
                                    label: name,
                                    value: name,
                                    lat: latResponse,
                                    lng: lngResponse,
                                });
                            }
                        }
                    }
                    if (landmarks_array.length > 0) {
                        setCategories(prevCategories => [
                            ...prevCategories.filter(cat => cat.name !== categoryName),
                            {
                                name: categoryName,
                                landmarks: landmarks_array,
                            }
                        ]);
                    }
                }
            });
    
            const encodedExtents = `${lower_lat},${left_lng},${upper_lat},${right_lng}`;
            const url = `https://www.onemap.gov.sg/api/public/themesvc/retrieveTheme?queryName=${queryName}&extents=${encodedExtents}`;
            xhr.open("GET", url);
            xhr.setRequestHeader("Authorization", OneMapsAPI_KEY);
            xhr.send();
        } catch (error) {
            //console.error(`Error fetching ${categoryName} landmarks:`, error);
            setLoading(false);
        }
    };



    const fetchParksLandmarks = () => {
        try {
            const xhr = new XMLHttpRequest();
    
            xhr.addEventListener("readystatechange", async function () {
                if (this.readyState === this.DONE) {
                    const response = JSON.parse(this.responseText);
                    const landmarks_array = [];
                    let length = response["SrchResults"].length;
                    for (let i = 1; i < length; i++) {
                        let name = response["SrchResults"][i]["NAME"].split(" ").map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                        ).join(" ");
                        let lat_lng = response["SrchResults"][i]["LatLng"];
                        let [latResponse, lngResponse] = lat_lng.split(',');
                        if (!landmarks_array.some(item => item.label === name)) {
                            const query = new URLSearchParams({
                                profile: "foot",
                                key: graphHopperAPI_KEY,
                            });
                            let point_string = `${lat},${lng}`;
                            query.append("point", point_string);
                            query.append('point', `${latResponse},${lngResponse}`);
                            const response = await fetch(
                                `https://graphhopper.com/api/1/route?${query.toString()}`
                            );
                            const data = await response.json();
                            const travel_distance = data?.paths?.[0]?.distance;
                            if (travel_distance !== undefined && travel_distance <= distance / 2) {
                                landmarks_array.push({
                                    label: name,
                                    value: name,
                                    lat: latResponse,
                                    lng: lngResponse,
                                });
                            }
                        }
                    }
                    if (landmarks_array.length > 0) {
                        setCategories(prevCategories => [
                            ...prevCategories.filter(cat => cat.name !== 'National Parks'),
                            {
                                name: 'National Parks',
                                landmarks: landmarks_array,
                            }
                        ]);
                    }
                    setLoading(false);
                }
            });
    
            const encodedExtents = `${lower_lat},${left_lng},${upper_lat},${right_lng}`;
            const url = `https://www.onemap.gov.sg/api/public/themesvc/retrieveTheme?queryName=nationalparks&extents=${encodedExtents}`;
            xhr.open("GET", url);
            xhr.setRequestHeader("Authorization", OneMapsAPI_KEY);
            xhr.send();
        } catch (error) {
            //console.error("Error fetching landmarks:", error);
            setLoading(false);
        }
    };


    const geocodeAddress = async () => {
        try {
            if (dropdownChoice == 'None'){
                router.push({
                    pathname: './GenerateRoute',
                    params: { lat: lat, lng: lng, landmarkLng: null, landmarkLat: null, distance: distance, shelterStatus: shelter },
                })
            }
            else{
                router.push({
                    pathname: './GenerateRoute',
                    params: { lat: lat, lng: lng, landmarkLng: landmarkLng, landmarkLat: landmarkLat, distance: distance, shelterStatus: shelter },
                })
            }
        } catch (error) {
            //console.error('Error fetching geocode:', error);
            Alert.alert('Error', 'Could not fetch geolocation');
        }
    };

    const handleBackButton = async () => {
        router.back(); 
    };

    const handleDropdown = async () => {
        setShowDropdown(true);
    }

    const handleSelection = async (value, landmarkLatitude, landmarkLongitude) => {
        setDropdownChoice(value);
        setLandmarkLat(landmarkLatitude);
        setLandmarkLng(landmarkLongitude);
        setShowDropdown(false);
    }

    const handleToggleShelter = async () => {
        setShelter(!shelter);
    }

    const fetchLandmarks = async () => {
        setLoading(true);
        setCategories([]);
        
        try {
            await fetchTourismLandmarks();
            await fetchCategoricalLandmarks("Heritage Trees", 'heritagetrees');
            await fetchCategoricalLandmarks("Historic Sites", "historicsites");
            await fetchCategoricalLandmarks("Monuments", "monuments");
            fetchParksLandmarks();
        } catch(error) {
            //console.error("Error fetching landmarks:", error);
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchLandmarks();
            return () => {
                setCategories([]);
            };
        }, [])
    );

    return (
        <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={RouteGenerationStyles.container}
        >   
            <ScrollView contentContainerStyle={{ flexGrow: 1}}>
                <View style={RouteGenerationStyles.mapContainer}>
                    <Map customLocation={{latitude: lat, longitude: lng}}/>
                    <BackButton onPress={handleBackButton} />
                </View>

                <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
                <View style={RouteGenerationStyles.formContainer}>
                    <Text style={[RouteGenerationStyles.text, {marginBottom: 10, fontSize: 20}]}>
                        Select a <Text style={[RouteGenerationStyles.text, {marginBottom: 10,fontWeight: "bold", fontSize: 20}]}>landmark</Text> from the drop-down list below
                    </Text>
                    <Pressable style={RouteGenerationStyles.dropdown} onPress={handleDropdown} onLayout={handleLayout}>
                        <Text>{dropdownChoice}</Text>
                    </Pressable>
        
                    <Pressable style={RouteGenerationStyles.button} onPress={geocodeAddress}>
                        <Text style={RouteGenerationStyles.buttonText}>Next</Text>
                    </Pressable>
                    
                    {showDropdown ? (
                        <ScrollView style={[RouteGenerationStyles.dropdownList, { bottom: 134 }]}>
                            <Pressable
                                onPress={() => handleSelection('None')}
                                style={RouteGenerationStyles.dropdownItem}>
                                <Text style={[RouteGenerationStyles.dropdownItemText, {fontWeight: 'bold'}]}>None</Text>
                            </Pressable>
                            {categories.map((category) => (
                                <View key={category.name}>
                                    <Text>-------------------------------------------------</Text>
                                    <Text style={[RouteGenerationStyles.dropdownItemText, {fontWeight:'bold', paddingHorizontal: 15}]}>{category.name}</Text>
                                    {category.landmarks.map((landmark) => (
                                        <Pressable
                                            key={landmark.value}
                                            onPress={() => handleSelection(landmark.value, landmark.lat, landmark.lng)}
                                            style={{paddingHorizontal: 15}}>
                                            <Text style={RouteGenerationStyles.landmarkText}>{landmark.label}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            ))}
                        </ScrollView>
                    ) : null}
                </View>
                </TouchableWithoutFeedback>
                <View style={RouteGenerationStyles.toggleShelterContainer}>
                    <Text style={RouteGenerationStyles.text}>Look for sheltered route</Text>
                    <AnimatedToggle 
                        isEnabled={shelter}
                        onToggle={handleToggleShelter}
                    />
                </View>
                {loading ? (
                    <View style={LoadingScreenStyles.container}>
                        <LoadingSpinner text="Finding landmarks" textColor="white" />
                        <BackButton onPress={handleBackButton} />
                    </View>
                ) : null}
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default GetLandmark;