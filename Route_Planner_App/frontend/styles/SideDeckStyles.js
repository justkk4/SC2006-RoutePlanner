import { StyleSheet, Platform, StatusBar, Dimensions } from 'react-native';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight;
const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: APPBAR_HEIGHT + STATUSBAR_HEIGHT,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#33A001',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sidebarContent: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  routePlannerImage: {
    width: width * 1,
    height: width * 0.5 * 0.5, 
    marginBottom: 20,
  },
  separator: {
    height: 1,
    width: '90%',
    backgroundColor: 'white',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#1B5500',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
    width: '80%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default styles;
