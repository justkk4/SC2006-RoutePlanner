import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, Pressable, Modal, ActivityIndicator, Image, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { getDistance } from 'geolib';
import * as SecureStore from 'expo-secure-store';
import styles from '../../styles/NavigationPageStyles';
import axiosInstance from '../../utils/axiosInstance';

const NavigationPage = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const routeCoordinates = params.routeCoordinates;
    const routeImage = params.routeImage;
    const parsedRouteCoordinates = useMemo(() => {
        try {
            const coords = JSON.parse(routeCoordinates);
            if (!Array.isArray(coords) || !coords.every(coord => 
                coord && typeof coord.latitude === 'number' && 
                typeof coord.longitude === 'number'
            )) {
                throw new Error('Invalid route coordinates format');
            }
            return coords;
        } catch (error) {
            console.error('Error parsing route coordinates:', error);
            return [];
        }
    }, [routeCoordinates]);
    const [parsedInstructions, setParsedInstructions] = useState([]);
    const [currentInstruction, setCurrentInstruction] = useState(null);
    const [isInstructionsReady, setIsInstructionsReady] = useState(false);
    const [runCompleted, setRunCompleted] = useState(false);
    const [location, setLocation] = useState(null);
    const [heading, setHeading] = useState(0);
    const [initialLocationSet, setInitialLocationSet] = useState(false);
    const [isRunning, setIsRunning] = useState(true);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [distanceTraveled, setDistanceTraveled] = useState(0);
    const [completedCoordinates, setCompletedCoordinates] = useState([]);
    const [showEndRunModal, setShowEndRunModal] = useState(false);
    const [routeProgress, setRouteProgress] = useState(0);
    const [segmentLengths, setSegmentLengths] = useState([]);
    const [totalRouteDistance, setTotalRouteDistance] = useState(0);
    const [isRouteInitialized, setIsRouteInitialized] = useState(false);
    const [instructionError, setInstructionError] = useState(null);
    const [currentInstructionIndex, setCurrentInstructionIndex] = useState(0);
    const [segmentBearings, setSegmentBearings] = useState([]);
    const currentHeading = isFinite(heading) ? heading : 0;
    const [lastValidInstruction, setLastValidInstruction] = useState({
        text: '',
        type: '',
        severity: '',
        distanceToTurn: Infinity,
    });
    const segmentLengthsRef = useRef([]);
    const totalRouteDistanceRef = useRef(0);
    const isRouteInitializedRef = useRef(false);
    const routeProgressRef = useRef(0);
    const currentInstructionIndexRef = useRef(0);
    const headingRef = useRef(0);

    const mapRef = useRef(null);
    const startTimeRef = useRef(Date.now());
    const locationSubscriptionRef = useRef(null);
    const headingSubscriptionRef = useRef(null);
    const timerRef = useRef(null);
    const previousCoordsRef = useRef(null);
    const lastValidLocationRef = useRef(null);
    const segmentBearingsRef = useRef([]);

    const LOCATION_ACCURACY_THRESHOLD = 50;
    const MIN_DISTANCE_THRESHOLD = 1;
    const MAX_SPEED_THRESHOLD = 20;
    const ROUTE_CORRIDOR_WIDTH = 30; 
    const OVERLAP_THRESHOLD = 30; 
    const INSTRUCTION_BUFFER_DISTANCE = 20;


    // Helper Functions
    const calculateBearingDifference = (bearing1, bearing2) => {
        let diff = ((bearing2 - bearing1 + 540) % 360) - 180;
        return diff;
    };

    const calculateBearing = (start, end) => {
        if (
            !start ||
            !end ||
            start.latitude == null ||
            start.longitude == null ||
            end.latitude == null ||
            end.longitude == null
          ) {
            console.error('Invalid coordinates in calculateBearing:', start, end);
            return 0;
          }

        const startLat = start.latitude * (Math.PI / 180);
        const startLng = start.longitude * (Math.PI / 180);
        const endLat = end.latitude * (Math.PI / 180);
        const endLng = end.longitude * (Math.PI / 180);
    
        const dLng = endLng - startLng;
        const y = Math.sin(dLng) * Math.cos(endLat);
        const x = Math.cos(startLat) * Math.sin(endLat) -
                  Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);
    
        let bearing = Math.atan2(y, x) * (180 / Math.PI);
        bearing = (bearing + 360) % 360;
        return bearing;
    };
    
    const getHeadingDifference = (heading1, heading2) => {
        const diff = Math.abs(heading1 - heading2) % 360;
        return diff > 180 ? 360 - diff : diff;
    };

    const projectPointOnSegment = (point, lineStart, lineEnd) => {
        const A = point.latitude - lineStart.latitude;
        const B = point.longitude - lineStart.longitude;
        const C = lineEnd.latitude - lineStart.latitude;
        const D = lineEnd.longitude - lineStart.longitude;
    
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
    
        if (lenSq !== 0) param = dot / lenSq;
    
        let projectedLat, projectedLng;
        if (param < 0) {
            projectedLat = lineStart.latitude;
            projectedLng = lineStart.longitude;
        } else if (param > 1) {
            projectedLat = lineEnd.latitude;
            projectedLng = lineEnd.longitude;
        } else {
            projectedLat = lineStart.latitude + param * C;
            projectedLng = lineStart.longitude + param * D;
        }
    
        return { latitude: projectedLat, longitude: projectedLng };
    };
    
    const HEADING_WEIGHT = 0.05; 

const projectToRoute = (location, heading, routeCoordinates, segmentBearings) => {
    if (!location ||!routeCoordinates ||!routeCoordinates.length ||!segmentBearings ||!segmentBearings.length) {
        console.error('Invalid inputs to projectToRoute:', {
          location,
          routeCoordinates,
          segmentBearings,
        });
        return {
          closestSegmentIndex: 0,
          closestPointOnSegment: location,
          distanceFromRoute: 0,
          headingDifference: 0,
        };
      }
      
    let minCost = Infinity;
    let closestSegmentIndex = 0;
    let closestPointOnSegment = null;
    
    for (let i = 0; i < routeCoordinates.length - 1; i++) {
        const segmentStart = routeCoordinates[i];
        const segmentEnd = routeCoordinates[i + 1];
        
        const projectedPoint = projectPointOnSegment(location, segmentStart, segmentEnd);
        const distance = getDistance(location, projectedPoint);
        
        const segmentBearing = segmentBearings[i];
        const headingDifference = getHeadingDifference(heading, segmentBearing);
        
        // Combine distance and heading difference into a cost
        const cost = distance + HEADING_WEIGHT * headingDifference;
        
        if (cost < minCost) {
            minCost = cost;
            closestSegmentIndex = i;
            closestPointOnSegment = projectedPoint;
        }
    }
    
    return {
        closestSegmentIndex,
        closestPointOnSegment,
        distanceFromRoute: getDistance(location, closestPointOnSegment),
        headingDifference: getHeadingDifference(heading, segmentBearings[closestSegmentIndex]),
    };
};
    

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const stopTracking = () => {
        if (locationSubscriptionRef.current) {
            locationSubscriptionRef.current.remove();
            locationSubscriptionRef.current = null;
        }
        if (headingSubscriptionRef.current) {
            headingSubscriptionRef.current.remove();
            headingSubscriptionRef.current = null;
        }
    };

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    // Core tracking functions
    const updateRouteProgress = (currentCoords, currentHeading) => {
        // Check if route data is initialized
        if (
            !isRouteInitializedRef.current ||
            segmentLengthsRef.current.length === 0 ||
            !totalRouteDistanceRef.current ||
            segmentBearingsRef.current.length === 0
          ) {
            console.log('Route data not ready:', {
              isInitialized: isRouteInitializedRef.current,
              segmentCount: segmentLengthsRef.current.length,
              totalDistance: totalRouteDistanceRef.current,
              segmentBearingsLength: segmentBearingsRef.current.length,
            });
            return;
          }
    
        const userLocation = {
            latitude: currentCoords.latitude,
            longitude: currentCoords.longitude,
        };
    
        
        const { closestSegmentIndex, closestPointOnSegment, distanceFromRoute,} = projectToRoute( userLocation, currentHeading, parsedRouteCoordinates, segmentBearingsRef.current);
        // Add distance check before processing route progress
        if (distanceFromRoute > 20) {
            setCurrentInstruction({
                text: "Please come back to the route",
                type: "warning",
                severity: "high",
            });
            return;
        }
    
        if (distanceFromRoute <= ROUTE_CORRIDOR_WIDTH) {
            // Calculate total distance covered up to current segment
            const distanceInPreviousSegments = segmentLengthsRef.current
                .slice(0, closestSegmentIndex)
                .reduce((sum, length) => sum + length, 0);
    
            // Calculate progress within current segment
            const segmentStart = parsedRouteCoordinates[closestSegmentIndex];
            const distanceInCurrentSegment = getDistance(segmentStart, closestPointOnSegment);
            const currentSegmentLength = segmentLengthsRef.current[closestSegmentIndex] || 0;
            const currentSegmentProgress = currentSegmentLength > 0 ? 
                distanceInCurrentSegment / currentSegmentLength : 0;
    
            // Calculate total progress
            const totalDistanceCovered = distanceInPreviousSegments + 
                (currentSegmentProgress * currentSegmentLength);
            const progress = (totalDistanceCovered / totalRouteDistanceRef.current) * 100;
    
            // Ensure progress doesn't decrease
            const updatedProgress = Math.max(progress, routeProgress);
            
            console.log('Progress calculation:', {
                segmentIndex: closestSegmentIndex,
                distanceInPreviousSegments,
                currentSegmentProgress: currentSegmentProgress.toFixed(2),
                totalDistanceCovered: totalDistanceCovered.toFixed(2),
                progress: progress.toFixed(2),
                updatedProgress: updatedProgress.toFixed(2)
            });
    
            setRouteProgress(updatedProgress);
            const newCompletedCoordinates = [];
            
            // Add all points up to and including current segment
            for (let i = 0; i <= closestSegmentIndex; i++) {
                newCompletedCoordinates.push(parsedRouteCoordinates[i]);
            }
    
            // Only add projected point if it's significantly different from the last point
            const lastPoint = parsedRouteCoordinates[closestSegmentIndex];
            const distanceToLastPoint = getDistance(
                lastPoint,
                closestPointOnSegment
            );
    
            if (distanceToLastPoint > 1) { // Only add if more than 1 meter away
                newCompletedCoordinates.push(closestPointOnSegment);
            }
    
            setCompletedCoordinates(newCompletedCoordinates);
    
            // Update navigation instructions if needed
            if (parsedInstructions?.length > 0) {
                const { instruction: newInstruction, currentInstructionIndex } = getCurrentInstruction(
                    { coords: currentCoords },
                    currentHeading,
                    parsedRouteCoordinates,
                    segmentBearingsRef.current,
                    parsedInstructions,
                    currentInstructionIndexRef.current
                );
              
                if (
                    newInstruction &&
                    (!currentInstruction || currentInstruction.text !== newInstruction.text)
                ) {
                    setCurrentInstruction(newInstruction);
                    setCurrentInstructionIndex(currentInstructionIndex);
                    currentInstructionIndexRef.current = currentInstructionIndex;
                }
            }
    
    
            if (process.env.NODE_ENV === 'development') {
                console.log('Detailed route info:', {
                    currentSegment: closestSegmentIndex,
                    totalSegments: parsedRouteCoordinates.length - 1,
                    distanceFromRoute: distanceFromRoute.toFixed(2),
                    completedPoints: newCompletedCoordinates.length,
                    totalRouteDistance: totalRouteDistanceRef.current.toFixed(2),
                    progress: updatedProgress.toFixed(2)
                });
            }
        } else {
            console.log('User is off-route, distance:', distanceFromRoute.toFixed(2));
        }
    };

    const initializeTracking = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location permission is required for navigation');
                return;
            }
    
            const initialLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.BestForNavigation
            });
            
            if (initialLocation.coords.accuracy > LOCATION_ACCURACY_THRESHOLD) {
                Alert.alert(
                    'Poor GPS Signal',
                    'Please ensure you are outdoors for better GPS accuracy',
                    [{ text: 'OK' }]
                );
                return;
            }
    
            setLocation(initialLocation);
            lastValidLocationRef.current = initialLocation;
            previousCoordsRef.current = initialLocation.coords;
            setInitialLocationSet(true);

        
    
            // Set up heading tracking
            headingSubscriptionRef.current = await Location.watchHeadingAsync((headingData) => {
                if (!isRunning) return;
                setHeading(headingData.trueHeading);
                headingRef.current = headingData.trueHeading;
            });
    
            // Set up location tracking
            locationSubscriptionRef.current = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    timeInterval: 1000,
                    distanceInterval: 1
                },
                (newLocation) => {
                    if (!isRunning) return;
    
                    // Validate location accuracy
                    if (newLocation.coords.accuracy <= LOCATION_ACCURACY_THRESHOLD) {
                        const coords = newLocation.coords;
                        const speed = coords.speed || 0;
    
                        // Only update if speed is reasonable
                        if (speed <= MAX_SPEED_THRESHOLD) {
                            setLocation(newLocation);
                            lastValidLocationRef.current = newLocation;
    
                            // Calculate distance to route
                            const nearestRoutePoint = parsedRouteCoordinates.reduce((nearest, point) => {
                                const distance = getDistance(
                                    { latitude: coords.latitude, longitude: coords.longitude },
                                    point
                                );
                                return distance < nearest.distance ? { point, distance } : nearest;
                            }, { point: parsedRouteCoordinates[0], distance: Infinity });

                            if (nearestRoutePoint.distance > ROUTE_CORRIDOR_WIDTH) {
                                console.log('User is off-route, distance:', nearestRoutePoint.distance.toFixed(2));
                                setCurrentInstruction({
                                    text: "Please come back to the route",
                                    type: "warning",
                                    severity: "high",
                                });
                            }
    
                            // Only process updates if we're reasonably close to the route
                            if (nearestRoutePoint.distance <= ROUTE_CORRIDOR_WIDTH) {
                                if (previousCoordsRef.current) {
                                    const distance = getDistance(
                                        {
                                            latitude: previousCoordsRef.current.latitude,
                                            longitude: previousCoordsRef.current.longitude,
                                        },
                                        {
                                            latitude: coords.latitude,
                                            longitude: coords.longitude,
                                        }
                                    );
    
                                    if (distance >= MIN_DISTANCE_THRESHOLD) {
                                        setDistanceTraveled(prev => prev + distance);
                                        previousCoordsRef.current = coords;
                                    }
                                } else {
                                    previousCoordsRef.current = coords;
                                }
    
                                // Define currentHeading
                                const currentHeading = heading || coords.heading || 0;

                                // Pass currentHeading to updateRouteProgress
                                updateRouteProgress(coords, currentHeading);

    
                                // Update navigation instructions if needed
                                if (parsedInstructions && parsedInstructions.length > 0) {
                                    const currentHeading = heading || initialLocation.coords.heading || 0;
                                    const { instruction: formattedInstruction } = getCurrentInstruction(
                                        initialLocation,
                                        currentHeading,
                                        parsedRouteCoordinates,
                                        segmentBearings,
                                        parsedInstructions
                                    );
                                    setCurrentInstruction(formattedInstruction);
                                }
    
                                if (mapRef.current) {
                                    mapRef.current.animateCamera({
                                        center: {
                                            latitude: coords.latitude,
                                            longitude: coords.longitude,
                                        },
                                        heading: heading,
                                        pitch: 0,
                                        zoom: 17,
                                    }, { duration: 500 });
                                }
                            }
                        }
                        if (!isRouteInitializedRef.current) {
                            console.error('Route data not initialized before starting tracking.');
                            return;
                          }
                    } else {
                        console.log('Poor location accuracy:', newLocation.coords.accuracy);
                    }
                }
            );
    
            // Start timer for run duration
            startTimeRef.current = Date.now();
            timerRef.current = setInterval(() => {
                if (isRunning) {
                    setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
                }
            }, 1000);
    
            // Initial route setup
            const initialProgress = Math.floor((0 / (parsedRouteCoordinates.length - 1)) * 100);
            setRouteProgress(initialProgress);
            setCompletedCoordinates([parsedRouteCoordinates[0]]);
    
            // Set initial instruction if available
            if (parsedInstructions && parsedInstructions.length > 0) {
                const currentHeading = heading || initialLocation.coords.heading || 0; 
                const { instruction: formattedInstruction } = getCurrentInstruction(
                  initialLocation,
                  currentHeading,
                  parsedRouteCoordinates,
                  segmentBearings,
                  parsedInstructions
                );
                setCurrentInstruction(formattedInstruction);
              }
    
        } catch (error) {
            console.error('Error initializing tracking:', error);
            setInstructionError(error.message);
            Alert.alert(
                'Error',
                'Failed to initialize navigation. Please check route data and try again.',
                [
                    {
                        text: 'Retry',
                        onPress: () => initializeTracking()
                    },
                    {
                        text: 'Cancel',
                        style: 'cancel'
                    }
                ]
            );
        }
    };

    const handleEndRun = async () => {
    try {
        setShowEndRunModal(false);
        setIsRunning(false);
        stopTracking();
        stopTimer();

        // Format the data properly
        const finalDistance = (distanceTraveled / 1000).toFixed(2);
        const finalTime = formatTime(elapsedTime);
        const currentDate = new Date().toISOString().split('T')[0];
        
        // Calculate pace (min/km)
        const totalMinutes = elapsedTime / 60;
        const paceMinutes = (finalDistance == 0 ? 0 : totalMinutes / parseFloat(finalDistance)); // Changed to handle distance 0
        const paceSeconds = Math.round((paceMinutes % 1) * 60);
        const pace = `${Math.floor(paceMinutes)}:${paceSeconds.toString().padStart(2, '0')}`;

        const token = await SecureStore.getItemAsync('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        // Create the run data object
        const runData = new FormData();
        runData.append('distance', finalDistance);
        runData.append('time', finalTime);
        runData.append('date', currentDate);
        runData.append('pace', pace);
        runData.append('routeImage', {
            uri: routeImage,  // The URI of the image
            name: 'routeImage.png',
            type: 'png',
        });

        console.log('Submitting run data:', runData);

        // Submit the run data
        const response = await axiosInstance.post('/runs', runData, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            }
        });

        if (response.status === 201 || response.status === 200) {
            console.log('Run saved successfully');
            router.push({
                pathname: './SummaryPage',
                params: {
                    distance: finalDistance,
                    time: finalTime,
                    routeCoordinates: routeCoordinates
                }
            });
        } else {
            throw new Error('Failed to save run data');
        }
    } catch (error) {
        console.error('Error saving run:', error);
        Alert.alert(
            'Error',
            'Failed to save run data. Please try again.',
            [
                {
                    text: 'Retry',
                    onPress: () => handleEndRun()
                },
                {
                    text: 'Cancel',
                    style: 'cancel'
                }
            ]
        );
    }
};

// Update getCurrentInstruction to handle post-turn segments
const getCurrentInstruction = (
    location,
    heading,
    routeCoordinates,
    segmentBearings,
    instructions,
    lastInstructionIndex = 0
) => {
    const userLocation = location.coords
        ? {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
          }
        : location;

    if (
        !userLocation?.latitude ||
        !routeCoordinates ||
        !routeCoordinates.length ||
        !instructions ||
        !instructions.length
    ) {
        return {
            instruction: lastValidInstruction || {
                text: 'Continue straight',
                type: 'straight',
                severity: 'low',
                distanceToTurn: 0,
            },
            currentInstructionIndex: lastInstructionIndex,
        };
    }

    // Project user onto route to get current progress
    const { closestSegmentIndex, closestPointOnSegment, distanceFromRoute } = projectToRoute(
        userLocation,
        heading,
        routeCoordinates,
        segmentBearings
    );
     // Check if user is too far from route first
     if (distanceFromRoute > 20) {
        return {
            instruction: {
                text: "Please come back to the route",
                type: "warning",
                severity: "high",
            },
            currentInstructionIndex: lastInstructionIndex
        };
    }

    // If user hasn't moved significantly (distance from last point is very small)
    if (lastValidInstruction && distanceFromRoute < 1) {
        return {
            instruction: lastValidInstruction,
            currentInstructionIndex: lastInstructionIndex,
        };
    }

    // Calculate cumulative distances along the route
    let cumulativeDistances = [0];
    for (let i = 1; i < routeCoordinates.length; i++) {
        const distance = getDistance(routeCoordinates[i - 1], routeCoordinates[i]);
        cumulativeDistances.push(cumulativeDistances[i - 1] + distance);
    }

    // User's distance along the route
    const distanceInPreviousSegments = cumulativeDistances[closestSegmentIndex];
    const distanceInCurrentSegment = getDistance(
        routeCoordinates[closestSegmentIndex],
        closestPointOnSegment
    );
    const userDistanceAlongRoute = distanceInPreviousSegments + distanceInCurrentSegment;

    // Find the next instruction ahead of the user
    let nextInstruction = null;
    let minDistanceToTurn = Infinity;
    let instructionIndex = Math.max(lastInstructionIndex, 0);

    for (let i = lastInstructionIndex; i < instructions.length; i++) {
        const instruction = instructions[i];
        const turnIndex = instruction.interval[0];
        const turnDistanceAlongRoute = cumulativeDistances[turnIndex];
        const distanceToTurn = turnDistanceAlongRoute - userDistanceAlongRoute;

        if (distanceToTurn <= 0) {
            continue;
        }

        if (distanceToTurn >= 0 && distanceToTurn < minDistanceToTurn) {
            minDistanceToTurn = distanceToTurn;
            nextInstruction = instruction;
            instructionIndex = i;
        }
    }

    if (!nextInstruction) {
        const finalInstruction = {
            text: 'Congrats on your run!',
            type: 'finish',
            severity: 'low',
            distanceToTurn: 0,
        };
        setLastValidInstruction(finalInstruction);
        return {
            instruction: finalInstruction,
            currentInstructionIndex: instructions.length,
        };
    }

    // Calculate actual distance to the turn point
    const turnPoint = routeCoordinates[nextInstruction.interval[0]];
    const distanceToTurnPoint = getDistance(userLocation, turnPoint);

    const formattedInstruction = formatInstruction(nextInstruction, distanceToTurnPoint);
    if (formattedInstruction) {
        // Do not update lastValidInstruction here
        return {
            instruction: formattedInstruction,
            currentInstructionIndex: instructionIndex,
        };
    } else {
        // Keep the last valid instruction
        return {
            instruction: lastValidInstruction,
            currentInstructionIndex: instructionIndex,
        };
    }
};

// Helper function to format the instruction text based on distance
const formatInstruction = (instruction, distance) => {
    let text;

    if (distance >= 0) {
        if (instruction.type !== 'straight' && instruction.type !== 'finish') {
            if (distance >= 50) {
                const roundedDistance = Math.round(distance / 10) * 10;
                text = `In ${roundedDistance}m, ${instruction.text.toLowerCase()}`;
            } else if (distance >= 10) {
                const roundedDistance = Math.round(distance / 10) * 10;
                text = `In ${roundedDistance}m, ${instruction.text.toLowerCase()}`;
            } else {
                text = instruction.text;
            }
        } else {
            text = instruction.text;
        }
    } else {
        // If the distance is negative, we have passed the turn
        return lastValidInstruction;
    }

    return {
        text,
        type: instruction.type,
        severity: getSeverity(instruction.type),
        streetName: instruction.streetName,
        distanceToTurn: distance,
    };
};

const getSeverity = (type) => {
    switch (type) {
        case 'uturn':
            return 'high';
        case 'sharp':
            return 'medium';
        case 'normal':
            return 'medium';
        case 'slight':
        case 'straight':
            return 'low';
        case 'finish':
            return 'low';
        default:
            return 'medium';
    }
};

const determineTurnDirection = (point1, point2, point3) => {
    const bearing1 = calculateBearing(point1, point2);
    const bearing2 = calculateBearing(point2, point3);
    const bearingDiff = calculateBearingDifference(bearing1, bearing2);

    // Corrected condition for direction
    const direction = bearingDiff > 0 ? 'right' : 'left';
    const angle = Math.abs(bearingDiff);

    return { direction, angle };
};

const generateInstructions = (routeCoordinates) => {
    const instructions = [];
    let lastInstructionIndex = 0;

    for (let i = 1; i < routeCoordinates.length - 1; i++) {
        const { direction, angle } = determineTurnDirection(
            routeCoordinates[i - 1],
            routeCoordinates[i],
            routeCoordinates[i + 1]
        );

        if (angle < 30) {
            // Continue straight
            continue;
        }

        if (i - lastInstructionIndex > 0) {
            // The 'Continue straight' instruction covers segments from lastInstructionIndex to i
            instructions.push({
                text: "Continue straight",
                interval: [lastInstructionIndex, i],
                type: "straight"
            });
        }

        let instructionType, instructionText;

        if (angle > 150) {
            instructionType = "uturn";
            instructionText = "Make a U-turn";
        } else if (angle > 110) {
            instructionType = "sharp";
            instructionText = `Turn sharp ${direction}`;
        } else if (angle > 45) {
            instructionType = "normal";
            instructionText = `Turn ${direction}`;
        } else {
            instructionType = "slight";
            instructionText = `Slight turn ${direction}`;
        }

        // The turn instruction corresponds to the segment starting at index i
        instructions.push({
            text: instructionText,
            interval: [i, i + 1],
            type: instructionType
        });

        lastInstructionIndex = i + 1;
    }

    // Final instruction
    if (lastInstructionIndex < routeCoordinates.length - 1) {
        instructions.push({
            text: "Move straight back to the start",
            interval: [lastInstructionIndex, routeCoordinates.length - 1],
            type: "finish"
        });
    } else {
        instructions.push({
            text: "Congrats on your run!",
            interval: [routeCoordinates.length - 1, routeCoordinates.length - 1],
            type: "finish"
        });
    }

    return instructions;
};

    // Effects
    useEffect(() => {
        if (isRouteInitialized) {
          initializeTracking();
        }
        return () => {
          stopTracking();
          stopTimer();
        };
      }, [isRouteInitialized]);

    useEffect(() => {
        routeProgressRef.current = routeProgress;
    }, [routeProgress]);
    
    useEffect(() => {
        currentInstructionIndexRef.current = currentInstructionIndex;
    }, [currentInstructionIndex]);
    
    useEffect(() => {
        headingRef.current = heading;
    }, [heading]);

    useEffect(() => {
        console.log('Starting instructions processing...');
        if (parsedRouteCoordinates) {
            try {
              const customInstructions = generateInstructions(parsedRouteCoordinates);
              setParsedInstructions(customInstructions);
              setIsInstructionsReady(true);
        
              if (customInstructions.length > 0) {
                const initialInstruction = {
                  text: customInstructions[0].text,
                  type: customInstructions[0].type,
                  severity: getSeverity(customInstructions[0].type),
                };
                setCurrentInstruction(initialInstruction);
              }
        
              console.log('Custom instructions generated:', customInstructions);
            } catch (error) {
              console.error('Error processing instructions:', error);
              setInstructionError(error.message);
            }
          }
    }, [parsedRouteCoordinates]);


    useEffect(() => {
        if (parsedInstructions && parsedInstructions.length > 0 && location) {
          console.log('Parsed Instructions:', parsedInstructions);
        }
    }, [parsedInstructions]);

    useEffect(() => {
        if (parsedRouteCoordinates && parsedRouteCoordinates.length > 0) {
          const lengths = [];
          const bearings = [];
          let total = 0;
      
          for (let i = 0; i < parsedRouteCoordinates.length - 1; i++) {
            const start = parsedRouteCoordinates[i];
            const end = parsedRouteCoordinates[i + 1];
            const distance = getDistance(start, end);
            lengths.push(distance);
            total += distance;
      
            const bearing = calculateBearing(start, end);
            bearings.push(bearing);
          }
      
          // Update state and refs
          setSegmentLengths(lengths);
          setTotalRouteDistance(total);
          setSegmentBearings(bearings);
          setIsRouteInitialized(true);
      
          segmentLengthsRef.current = lengths;
          totalRouteDistanceRef.current = total;
          isRouteInitializedRef.current = true;
      
          // Update segmentBearingsRef
          segmentBearingsRef.current = bearings;
      
          console.log('Route data initialized:', {
            segmentCount: lengths.length,
            totalDistance: total,
            bearingsCount: bearings.length,
          });
        }
      }, [parsedRouteCoordinates]);

      useEffect(() => {
        if (!isInstructionsReady || !location || !parsedInstructions?.length || !segmentBearings?.length) {
            return;
        }
    
        try {
            const currentHeading = heading || location.coords.heading || 0;
            const { instruction, currentInstructionIndex: newInstructionIndex } = getCurrentInstruction(
                location,
                currentHeading,
                parsedRouteCoordinates,
                segmentBearings,
                parsedInstructions,
                currentInstructionIndex
            );
            console.log('useEffect triggered: updating currentInstruction');
            console.log('Received instruction:', instruction);
            console.log('Current instruction before update:', currentInstruction);
            console.log('Current instruction index:', currentInstructionIndex);
            console.log('New instruction index:', newInstructionIndex);
    
            if (instruction) {
                if (
                    !currentInstruction ||
                    instruction.text !== currentInstruction.text ||
                    newInstructionIndex > currentInstructionIndex && 
                    newInstructionIndex > currentInstructionIndex
                ) {
                    console.log('Updating currentInstruction to:', instruction);
                    setCurrentInstruction(instruction);
                    setCurrentInstructionIndex(newInstructionIndex);
                    setLastValidInstruction(instruction); // Update lastValidInstruction here
                }
            } else {
                // If instruction is null, maintain the last valid instruction
                setCurrentInstruction(lastValidInstruction);
            }
        } catch (error) {
            console.error('Error updating instruction:', error);
            setInstructionError(error.message);
        }
    }, [location, heading, isInstructionsReady, parsedInstructions, currentInstructionIndex, segmentBearings]);

    useEffect(() => {
        console.log('Route data updated:', {
            segmentCount: segmentLengths.length,
            totalDistance: totalRouteDistance,
            isInitialized: isRouteInitialized
        });
    }, [segmentLengths, totalRouteDistance, isRouteInitialized]);

    useEffect(() => {
        if (
            routeProgress >= 98 &&
            distanceTraveled >= 100 &&
            !runCompleted
        ) {
            setRunCompleted(true);
            handleEndRun();
        }
    }, [routeProgress, distanceTraveled, runCompleted]);


    const renderInstructions = () => {
        if (!currentInstruction?.text) {
            return null;
        }
    
        const getInstructionStyle = () => {
            if (currentInstruction.text === "Please come back to the route") {
                return styles.instructionCardUrgent; // This will make the warning message red
            }
    
            switch (currentInstruction.severity) {
                case 'high':
                    return styles.instructionCardUrgent;
                case 'medium':
                    return styles.instructionCardNormal;
                case 'low':
                    return styles.instructionCardMild;
                default:
                    return styles.instructionCard;
            }
        };
    
        return (
            <View style={styles.instructionContainer}>
                <View style={[styles.instructionCard, getInstructionStyle()]}>
                    <Text style={styles.instructionText}>
                        {currentInstruction.text}
                    </Text>
                    {currentInstruction.streetName && currentInstruction.text !== "Please come back to the route" && (
                        <Text style={styles.streetNameText}>
                            on {currentInstruction.streetName}
                        </Text>
                    )}
                </View>
            </View>
        );
    };
    return (
        <View style={styles.container}>
            <View style={styles.mapContainer}>
                <MapView.Animated
                    ref={mapRef}
                    provider={PROVIDER_DEFAULT}
                    style={styles.map}
                    initialRegion={{
                        latitude: parsedRouteCoordinates[0].latitude,
                        longitude: parsedRouteCoordinates[0].longitude,
                        latitudeDelta: 0.002,
                        longitudeDelta: 0.002,
                    }}
                    showsUserLocation={true}
                    showsCompass={true}
                    rotateEnabled={true}
                    pitchEnabled={false}
                >
                    {/* Full Route */}
                    <Polyline
                        coordinates={parsedRouteCoordinates}
                        strokeWidth={5}
                        strokeColor="#0000FF"
                        zIndex={1}
                    />
    
                    {/* Completed Route */}
                    {completedCoordinates.length > 0 && (
                        <Polyline
                            coordinates={completedCoordinates}
                            strokeWidth={5}
                            strokeColor="#87CEEB"
                            zIndex={2}
                        />
                    )}
    
                    {/* Current Location Marker */}
                    {location && (
                        <Marker
                            coordinate={{
                                latitude: location.coords.latitude,
                                longitude: location.coords.longitude,
                            }}
                            anchor={{ x: 0.5, y: 0.5 }}
                            flat={true}
                            zIndex={3}
                        >
                            <Image
                                source={require('../../assets/arrow.png')}
                                style={{
                                    width: 40,
                                    height: 40,
                                    transform: [{ rotate: `${heading}deg` }],
                                }}
                                resizeMode="contain"
                            />
                        </Marker>
                    )}
                </MapView.Animated>
            </View>

            {/* Navigation Instructions with Error Handling */}
            {instructionError ? (
                <View style={styles.instructionContainer}>
                    <View style={[styles.instructionCard, styles.errorCard]}>
                        <Text style={styles.errorText}>
                            Error displaying navigation: {instructionError}
                        </Text>
                    </View>
                </View>
            ) : (
                isInstructionsReady && renderInstructions()
            )}
    
            {/* Stats and End Run Button Container */}
            <View style={styles.bottomContainer}>
                <View style={styles.bottomCard}>
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{formatTime(elapsedTime)}</Text>
                            <Text style={styles.statLabel}>Time</Text>
                        </View>
                        
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>
                                {(distanceTraveled / 1000).toFixed(2)}
                            </Text>
                            <Text style={styles.statLabel}>Distance (km)</Text>
                        </View>
                        
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>
                                {Math.round(routeProgress)}%
                            </Text>
                            <Text style={styles.statLabel}>Progress</Text>
                        </View>
                    </View>
                    
                    <Pressable 
                        style={styles.endRunButton} 
                        onPress={() => setShowEndRunModal(true)}
                    >
                        <Text style={styles.endRunText}>End Run</Text>
                    </Pressable>
                </View>
            </View>
    
            {/* End Run Modal */}
            <Modal
                visible={showEndRunModal}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>
                            Are you sure you want to end your run?
                        </Text>
                        <View style={styles.modalButtons}>
                            <Pressable
                                style={[styles.modalButton, styles.modalButtonPrimary]}
                                onPress={handleEndRun}
                            >
                                <Text style={styles.modalButtonText}>Yes, End Run</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.modalButton, styles.modalButtonSecondary]}
                                onPress={() => setShowEndRunModal(false)}
                            >
                                <Text style={[styles.modalButtonText, styles.modalButtonTextSecondary]}>
                                    Continue Running
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
    
            {/* Loading Overlay */}
            {!initialLocationSet && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#33A001" />
                    <Text style={styles.loadingText}>
                        Getting your location...
                    </Text>
                    <Text style={styles.loadingSubText}>
                        Please ensure you are outdoors for better GPS accuracy
                    </Text>
                </View>
            )}
    
            {/* Error Overlay */}
            {location && location.coords.accuracy > 100 && (
                <View style={styles.errorOverlay}>
                    <Text style={styles.errorText}>
                        GPS signal is weak. Please move to an open area for better accuracy.
                    </Text>
                    <Pressable 
                        style={styles.retryButton}
                        onPress={initializeTracking}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </Pressable>
                </View>
            )}
        </View>
    );
};

export default NavigationPage;