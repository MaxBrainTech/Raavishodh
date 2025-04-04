import React from "react";
import { View, Text, StyleSheet } from "react-native";

const FeatureLayout = ({ title, description }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  //  flex:1
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color:'white',
  },
  description: {
    fontSize: 16,
    marginTop: 5,
    color: "white",
  },
});

export default FeatureLayout;