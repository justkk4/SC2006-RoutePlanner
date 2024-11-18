import { StyleSheet, Dimensions } from "react-native";

const { height } = Dimensions.get('window');
const RegisterStyles = StyleSheet.create({
  container: {
    backgroundColor: '#A5FF7B',
    flex: 1
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
    top: height * 0.2,
    gap: 10,
    width: "85%",
    paddingHorizontal: 10,
    backgroundColor: '#33A000',
    paddingVertical: 20,
    borderRadius: 20,
    alignSelf: 'center',
    shadowColor: '#00000',
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 5,
    shadowOpacity: 0.3
  },
  inputView: {
    paddingBottom: 30,
  },
  inputHeader: {
    color: "white",
    fontFamily: "Syne_500Medium",
    paddingTop: 12,
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
  buttonRegister: {
    backgroundColor: "#A5FF7B",
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: '#00000',
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 5,
    shadowOpacity: 0.3,
  },
  buttonSign: {
    backgroundColor: "#267600",
    height: 40,
    borderRadius: 30,
    borderColor: 'white',
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: '#00000',
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 5,
    shadowOpacity: 0.3,
    flex: 2
  },
  buttonRegisterText: {
    color: "#33A000"  ,
    fontSize: 30,
  },
  buttonSignText: {
    color: "white"  ,
    fontSize: 18,
  },  
  buttonView:{
    width: "90%",
    paddingBottom: 50,
    alignSelf: 'center'
  },
  signBox: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    padding: 10,
    paddingBottom: 30
  }
})

export default RegisterStyles;