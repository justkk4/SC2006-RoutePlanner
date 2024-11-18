import { StyleSheet } from 'react-native';
import RouteGenerationStyles from './RouteGenerationStyles';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    mapContainer: {
        ...RouteGenerationStyles.mapContainer,
    },
    buttonContainer: {
        ...RouteGenerationStyles.formContainer,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        height: '20%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        flex: 0.35,
        position: 'absolute',
        width: '100%'
    },
    startRunButton: {
        backgroundColor: '#33A001',
        borderRadius: 25,
        paddingVertical: 15,
        paddingHorizontal: 30,
        justifyContent: 'center',
        alignItems: 'center',
        width: '75%',
        borderWidth: 3,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    startRunButtonDisabled: {
        backgroundColor: '#999999',
    },
    startRunButtonText: {
        color: 'white',
        fontSize: 40,
        fontWeight: 'bold',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        width: '85%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalText: {
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 25,
        color: '#333',
    },
    modalButtons: {
        width: '100%',
        flexDirection: 'column',
        gap: 10,
    },
    modalButton: {
        width: '100%',
        padding: 15,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalButtonPrimary: {
        backgroundColor: '#33A001',
    },
    modalButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 3,
    },
    loadingText: {
        marginTop: 20,
        fontSize: 18,
        color: '#33A001',
        fontWeight: '600',
    },
    loadingSubText: {
        marginTop: 10,
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    errorOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 3,
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#FF3B30',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#33A001',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default styles;