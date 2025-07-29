import React from "react";
import { Modal, View, Text, ActivityIndicator } from "react-native";
import globalStyles from "../../styles/globalStyles";

const LoaderModal = ({ visible, message }) => {
  if (!visible) return null;
  return (
    <Modal transparent animationType="fade">
      <View style={globalStyles.modalOverlay}>
        <View style={globalStyles.loaderBox}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={globalStyles.loaderText}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

export default LoaderModal;
