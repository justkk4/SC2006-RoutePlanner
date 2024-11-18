import { StyleSheet, Dimensions } from "react-native";
const { height } = Dimensions.get('window');

const LoginStyles = StyleSheet.create({
  container: {
    backgroundColor: '#A5FF7B',
    flex: 1
  },
  image: {
    height: 250,
    width: 300,
    marginBottom: 80
  },
  topHalf: {
    flex: 3,
    backgroundColor: '#A5FF7B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomHalf: {
    flex: 2.5,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlign: "center",
    color: "white",
    fontFamily: "Inter_700Bold"
  },
  formView: {
    position: 'absolute',
    top: height * 0.4,
    gap: 15,
    width: "80%",
    paddingHorizontal: 10,
    backgroundColor: '#33A000',
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'center',
    shadowColor: '#00000',
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 5,
    shadowOpacity: 0.3
  },
  inputView: {
    paddingBottom: 60,
  },
  inputHeader: {
    color: "white",
    fontFamily: "Syne_500Medium",
    paddingTop: 20,
    fontSize: 15
  },
  inputField: {
    height: 35,
    width: '100%',
    paddingHorizontal: 10,
    borderColor: "white",
    backgroundColor: "white",
    borderWidth: 1,
    borderRadius: 7,
    shadowColor: '#00000',
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 5,
    shadowOpacity: 0.3
  },
  eyeIcon: {
    position: 'absolute',
    right: 5,
    bottom: height * 0.005
  },
  buttonSign: {
    backgroundColor: "#A5FF7B",
    height: 45,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: '#00000',
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 5,
    shadowOpacity: 0.3
  },
  buttonRegister: {
    backgroundColor: "#267600",
    height: 45,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: '#00000',
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 5,
    shadowOpacity: 0.3
  },
  buttonSignText: {
    color: "#33A000"  ,
    fontSize: 18,
    fontWeight: "bold"
  },
  buttonRegisterText: {
    color: "white"  ,
    fontSize: 18,
    fontWeight: "bold"
  },  
  buttonView:{
    width: "100%",
  },
})

export default LoginStyles;