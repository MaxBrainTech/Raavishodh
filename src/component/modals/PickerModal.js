import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import globalStyles from "../../styles/globalStyles";

const PickerModal = ({ visible, onCamera, onGallery, onClose }) => {
  if (!visible) return null;
  return (
    <Modal transparent animationType="fade">
      <View style={globalStyles.modalOverlay}>
        <View style={globalStyles.alertBox}>
          <Text style={[globalStyles.alertText, { marginBottom: 20 }]}>
            Select an option to upload an image
          </Text>
          <View style={{ flexDirection: "row", gap: 20 }}>
            <TouchableOpacity style={globalStyles.alertButton} onPress={onCamera}>
              <Text style={globalStyles.alertButtonText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={globalStyles.alertButton} onPress={onGallery}>
              <Text style={globalStyles.alertButtonText}>Gallery</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[globalStyles.alertButton, { marginTop: 15, backgroundColor: "#444" }]}
            onPress={onClose}
          >
            <Text style={[globalStyles.alertButtonText, { color: "#fff" }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default PickerModal;
