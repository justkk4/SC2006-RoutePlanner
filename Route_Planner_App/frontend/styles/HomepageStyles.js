import { StyleSheet } from 'react-native';

const HomepageStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    circle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(0, 0, 161, 0.9)',
        borderWidth: 3,
        borderColor: 'rgba(226, 226, 226, 0.8)',
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
});

export default HomepageStyles;

