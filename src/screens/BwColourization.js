import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
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

export default function BwColourization() {
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
  const [processedImage, setProcessedImage] = useState(null);
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

  const generateColorizedImage = async () => {
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
            "ca494ba129e44e45f661d6ece83c4c98a9a7c774309beca01429b58fce8aa695",
          input: {
            image: `data:image/jpeg;base64,${base64Image}`,
            model_size: "large",
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to process image");

      const data = await response.json();
      const resultUrl = await checkReplicateStatus(data.urls.get);

      if (resultUrl) {
        setProcessedImage(resultUrl);
        incrementUsage();
      } else {
        throw new Error(
          "Processing failed. Please try again or try uploading a lower-quality image."
        );
      }
    } catch (err) {
      showAlert(
        err.message ||
          "Processing failed. Please try again or try uploading a lower-quality image."
      );
    } finally {
      setLoader({ visible: false, message: "" });
    }
  };

  /** Polling function */
  const checkReplicateStatus = async (statusUrl) => {
    try {
      while (true) {
        const response = await fetch(statusUrl, {
          headers: { Authorization: `Token ${REPLICATE_API_TOKEN}` },
        });

        if (!response.ok) throw new Error("Status fetch failed");

        const data = await response.json();

        if (data.status === "succeeded") return data.output;
        if (data.status === "failed") return null;

        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error("Status check error:", error);
      return null;
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
                  source={require("../../assets/gif/B&W.png")}
                  style={styles.gif}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </View>
            </View>
          </Modal>

          <FeatureLayout
            title="B & W Colorization"
            description="Bring black & white photos to life with colors."
            operationId="bw-colorization"
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

          {selectedImage && !processedImage && (
            <Btn title="Colorized Image" onPress={generateColorizedImage} />
          )}

          {processedImage && (
            <View style={styles.imageWrapper}>
              <Text style={styles.imageLabel}>Result</Text>
              <Image
                source={{ uri: processedImage }}
                style={styles.uploadedImage}
                onLoadStart={() =>
                  setLoader({ visible: true, message: "Loading result..." })
                }
                onLoadEnd={() => setLoader({ visible: false, message: "" })}
              />

              {downloading ? (
                <View style={{ marginTop: 10 }}>
                  <ActivityIndicator size="large" color="#ffffff" />
                  <Text style={{ color: "#fff", marginTop: 8 }}>
                    Saving to Downloads...
                  </Text>
                </View>
              ) : (
                <Btn title="Download Image"  onPress={() => handleDownload(processedImage, "colorized")} />
              )}
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
