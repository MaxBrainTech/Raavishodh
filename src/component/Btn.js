import React from "react";
import { StyleSheet, TouchableOpacity,Text } from "react-native";
import PropTypes from "prop-types";

const Btn =props => {
    return (
<TouchableOpacity style={styles.button}
onPress={() => props.onPress()} >
    
    <Text style={styles.buttonText}> {props.title}</Text>

</TouchableOpacity>
    );
};

 Btn.PropTypes = {
    title: PropTypes.string.isRequired,
    onPress: PropTypes.func.isRequired,
 };

const styles = StyleSheet.create({
    button: {
        flexDirection: "row",
        backgroundColor: "#6a11cb",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 30,
        alignItems: "center",
        alignSelf: "center",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
        marginRight: 8,
    },
})
export default Btn;