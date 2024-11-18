import { StyleSheet } from 'react-native';

const LoadingScreenStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#33A001',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        height: '100%',
        width: '100%',
        zIndex: 999,
    },
});

export default LoadingScreenStyles;

