import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import FastImage from "react-native-fast-image";
import LinearGradient from "react-native-linear-gradient";
import FeatureLayout from "../component/FeatureLayout";
import RNFS from "react-native-fs";
import { REPLICATE_API_TOKEN } from "@env";
import Btn from "../component/Btn";
import useDownload from "../utils/useDownload";
import useImageHandler from "../hook/useImageHandler";
import globalStyles from "../styles/globalStyles";

import LoaderModal from "../component/modals/LoaderModal";
import AlertModal from "../component/modals/AlertModal";
import PickerModal from "../component/modals/PickerModal";

const tutorialSteps = [
  {
    title: "Upload Your Image",
    description:
      "• Click the button below to select an image.\n• Max file size: 10MB.\n• Supported formats: JPEG, PNG, WebP.",
  },
];

export default function SuperResolution() {
  const {
    selectedImage,
    setSelectedImage,
    error,
    pickFromCamera,
    pickFromGallery,
    incrementUsage,
  } = useImageHandler("ai_usage_count");

  const [showTutorial, setShowTutorial] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [enhancedImage, setEnhancedImage] = useState(null);
  const [isModalVisible, setModalVisible] = useState(true);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [alertModal, setAlertModal] = useState({ visible: false, message: "" });

  const [loader, setLoader] = useState({ visible: false, message: "" });

  const showAlert = (msg) => setAlertModal({ visible: true, message: msg });
  const hideAlert = () => setAlertModal({ visible: false, message: "" });

  const { handleDownload } = useDownload(showAlert, setLoader);

  useEffect(() => {
    if (error) showAlert(error);
  }, [error]);

  const processImage = async () => {
    if (!selectedImage) {
      showAlert("Please select an image first!");
      return;
    }

    setLoader({ visible: true, message: "Processing..." });
    try {
      const base64Image = await RNFS.readFile(selectedImage, "base64");

      const response = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${REPLICATE_API_TOKEN}`,
        },
        body: JSON.stringify({
          version:
            "f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa", // Super-resolution model
          input: {
            image: `data:image/jpeg;base64,${base64Image}`,
            scale: 2,
            face_enhance: true,
          },
        }),
      });

      const result = await response.json();
      if (result?.error) throw new Error(result.error);

      let prediction = result;
      while (prediction.status === "starting" || prediction.status === "processing") {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const checkResponse = await fetch(
          `https://api.replicate.com/v1/predictions/${prediction.id}`,
          { headers: { Authorization: `Token ${REPLICATE_API_TOKEN}` } }
        );
        prediction = await checkResponse.json();
      }

      if (prediction.status === "succeeded") {
        setEnhancedImage(prediction.output);
        incrementUsage();
      } else {
     throw new Error("Processing failed. Please try again or try uploading a lower-quality image.");
      }
    } catch (error) {
      showAlert(
        error.message ||
          "Processing failed. Please try again or try uploading a lower-quality image."
      );
    } finally {
      setLoader({ visible: false, message: "" });
    }
  };

  return (
    <LinearGradient colors={["#0d1117", "#8ec5fc"]} style={globalStyles.gradient}>
     
      <LoaderModal visible={loader.visible} message={loader.message} />
     
      <AlertModal
        visible={alertModal.visible}
        message={alertModal.message}
        onClose={hideAlert}
      />

      <PickerModal
        visible={pickerVisible}
        onCamera={() => {
          setPickerVisible(false);
          pickFromCamera();
        }}
        onGallery={() => {
          setPickerVisible(false);
          pickFromGallery();
        }}
        onClose={() => setPickerVisible(false)}
      />

      <ScrollView contentContainerStyle={globalStyles.scrollContainer}>
        <View style={globalStyles.container}>
      
          <Modal
            animationType="slide"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContentContainer}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>X</Text>
                </TouchableOpacity>

                <FastImage
                  source={require("../../assets/gif/superResolution.png")}
                  style={styles.gif}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </View>
            </View>
          </Modal>

          <FeatureLayout
            title="AI Super Resolution"
            description="Enhance facial features using our advanced AI technology."
            operationId="super-resolution"
          />

          {!selectedImage && showTutorial && (
            <View style={globalStyles.tutorialContainer}>
              <Text style={globalStyles.tutorialTitle}>{tutorialSteps[0].title}</Text>
              <Text style={globalStyles.tutorialText}>
                {tutorialSteps[0].description}
              </Text>
            </View>
          )}

          {!selectedImage && (
            <Btn title="Upload Image" onPress={() => setPickerVisible(true)} />
          )}

          {selectedImage && (
            <View style={styles.imageWrapper}>
              <Text style={styles.imageLabel}>Selected Image</Text>
              <Image source={{ uri: selectedImage }} style={styles.uploadedImage} />
            </View>
          )}

          {selectedImage && !enhancedImage && (
            <Btn title="Resolute Image" onPress={processImage} />
          )}

          {enhancedImage && (
            <View style={styles.imageWrapper}>
              <Text style={styles.imageLabel}>Result</Text>
              <Image source={{ uri: enhancedImage }} style={styles.uploadedImage}
               onLoadStart={() => setLoader({ visible: true, message: "Loading result..." })}
      onLoadEnd={() => setLoader({ visible: false, message: "" })} />

                <Btn title="Download Image"  onPress={() => handleDownload(enhancedImage, "resoluted")} />
           
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(70, 71, 77, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContentContainer: {
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 20,
    borderRadius: 25,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#222",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    zIndex: 10,
  },
  closeButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  gif: { width: 250, height: 250, borderRadius: 20 },
  uploadedImage: {
    width: 250,
    height: 250,
    borderRadius: 10,
    resizeMode: "contain",
    marginBottom: 20,
  },
  imageWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 20,
    padding: 20,
    marginVertical: 20,
    alignItems: "center",
    width: "85%",
  },
  imageLabel: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 10,
  },
});
