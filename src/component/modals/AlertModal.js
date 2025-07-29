import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import globalStyles from "../../styles/globalStyles";

const AlertModal = ({ visible, message, onClose }) => {
  if (!visible) return null;
  return (
    <Modal transparent animationType="fade">
      <View style={globalStyles.modalOverlay}>
        <View style={globalStyles.alertBox}>
          <Text style={globalStyles.alertText}>{message}</Text>
          <TouchableOpacity style={globalStyles.alertButton} onPress={onClose}>
            <Text style={globalStyles.alertButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AlertModal;
