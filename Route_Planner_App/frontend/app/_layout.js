import { Stack } from 'expo-router';

const Layout = () => {
    const screenOptions = {
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        transitionSpec: {
            open: {
                animation: 'timing',
                config: {
                    duration: 300,
                },
            },
            close: {
                animation: 'timing',
                config: {
                    duration: 300,
                },
            },
        },
        cardStyleInterpolator: ({ current, layouts }) => {
            return {
                cardStyle: {
                    transform: [
                        {
                            translateX: current.progress.interpolate({
                                inputRange: [0, 1],
                                outputRange: [layouts.screen.width, 0],
                            }),
                        },
                    ],
                },
            };
        },
    };

    return (
        <Stack screenOptions={screenOptions}>
            <Stack.Screen
                name="Homepage/Homepage"
            />
            <Stack.Screen
                name="Route_Generation/GetStartAddress"
            />
            <Stack.Screen
                name="Route_Generation/GetDistance"
            />
            <Stack.Screen
                name="Route_Generation/GetLandmark"
            />
            <Stack.Screen
                name="Route_Generation/GenerateRoute"
            />
            <Stack.Screen
                name="Route_Generation/StartRun"
            />
            <Stack.Screen
                name="Navigation/NavigationPage"
            />
            <Stack.Screen
                name="View_Run_History/RunHistoryPage"
            />
            <Stack.Screen
                name="View_Run_History/RunSummary"
            />
            <Stack.Screen
                name="Login/Login"
            />
            <Stack.Screen
                name="Login/Register"
            />
        </Stack>
    );
};

export default Layout;