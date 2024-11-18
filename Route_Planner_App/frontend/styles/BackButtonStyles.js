import { StyleSheet } from 'react-native';

const BackButtonStyles = StyleSheet.create({
    button: {
        backgroundColor: '#0c551a',
        borderColor: 'white',
        borderWidth: 3,
        padding: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 25,
        width: '25%',
        position: 'absolute',
        top: 50,
        left: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 20,
        textAlign: 'center',
    },
});

export default BackButtonStyles;