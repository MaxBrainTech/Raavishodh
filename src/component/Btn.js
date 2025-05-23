import React from "react";
import { StyleSheet, TouchableOpacity,Text } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import PropTypes from "prop-types";

const Btn =props => {
    return (
        <LinearGradient colors={['#6EE7B7', '#3B82F6']} style={styles.gradientButton}>
<TouchableOpacity style={styles.button}
onPress={() => props.onPress()} >
    
    <Text style={styles.buttonText}> {props.title}</Text>

</TouchableOpacity>
</LinearGradient>
    );
};

 Btn.PropTypes = {
    title: PropTypes.string.isRequired,
    onPress: PropTypes.func.isRequired,
 };

const styles = StyleSheet.create({
   gradientButton: {
  width: 220,
  paddingVertical: 14,
  borderRadius: 30,
  marginVertical: 10,
},
button: {
  alignItems: 'center',
},
buttonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
  letterSpacing: 0.5,
},

})
export default Btn;