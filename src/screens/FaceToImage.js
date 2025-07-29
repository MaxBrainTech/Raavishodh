import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import FastImage from "react-native-fast-image";
import FeatureLayout from "../component/FeatureLayout";
import RNFS from "react-native-fs";
import axios from "axios";
import { REPLICATE_API_TOKEN } from "@env";
import LinearGradient from "react-native-linear-gradient";
import Btn from "../component/Btn";
import { downloadImageFile } from "../utils/downloadImage";
import useImageHandler from "../hook/useImageHandler";
import globalStyles from "../styles/globalStyles";

// Import separate modal components
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

export default function FaceToImage() {
  const {
    selectedImage,
    setSelectedImage,
    loading,
    error,
    pickFromCamera,
    pickFromGallery,
    incrementUsage,
  } = useImageHandler("ai_usage_count");

  const [showTutorial, setShowTutorial] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [processing, setProcessing] = useState(false);
  const [enhancedImage, setEnhancedImage] = useState(null);
  const [isModalVisible, setModalVisible] = useState(true);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [alertModal, setAlertModal] = useState({ visible: false, message: "" });

  const showAlert = (msg) => setAlertModal({ visible: true, message: msg });
  const hideAlert = () => setAlertModal({ visible: false, message: "" });

  // Show alert if hook returns error
  useEffect(() => {
    if (error) showAlert(error);
  }, [error]);

  /** Process image with Replicate API */
  const processImage = async () => {
    if (!selectedImage) {
      showAlert("Please select an image first!");
      return;
    }

    setProcessing(true);
    try {
      const base64Image = await RNFS.readFile(selectedImage, "base64");

      const response = await axios.post(
        "https://api.replicate.com/v1/predictions",
        {
          version:
            "43d309c37ab4e62361e5e29b8e9e867fb2dcbcec77ae91206a8d95ac5dd451a0",
          input: {
            prompt: prompt,
            cfg_scale: 1.2,
            num_steps: 4,
            image_width: 768,
            num_samples: 4,
            image_height: 1024,
            output_format: "webp",
            identity_scale: 0.8,
            mix_identities: false,
            output_quality: 80,
            generation_mode: "fidelity",
            main_face_image: `data:image/jpeg;base64,${base64Image}`,
            negative_prompt:
              "flaws in the eyes, flaws in the face, low quality, artifacts, watermark, blurry",
          },
        },
        {
          headers: {
            Authorization: `Token ${REPLICATE_API_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      let prediction = response.data;
      if (prediction?.error) throw new Error(prediction.error);

      while (
        prediction.status === "starting" ||
        prediction.status === "processing"
      ) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const checkResponse = await axios.get(
          `https://api.replicate.com/v1/predictions/${prediction.id}`,
          { headers: { Authorization: `Token ${REPLICATE_API_TOKEN}` } }
        );
        prediction = checkResponse.data;
      }

      if (prediction.status === "succeeded") {
        if (Array.isArray(prediction.output) && prediction.output.length > 0) {
          setEnhancedImage(prediction.output);
          incrementUsage(); // mark usage after success
        } else {
          throw new Error("Invalid API response format");
        }
      } else {
        throw new Error(`Processing failed: ${prediction.status}`);
      }
    } catch (error) {
      showAlert(error.message || "Image processing failed");
    }
    setProcessing(false);
  };

  /** Download result */
  const downloadImage = async (url) => {
    if (!url) return;
    try {
      setDownloading(true);
      await downloadImageFile(url, "face2image");
    } catch (err) {
      showAlert(err.message || "Could not download the image.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <LinearGradient colors={["#0d1117", "#8ec5fc"]} style={globalStyles.gradient}>
      {/* Loader Modal */}
      <LoaderModal visible={loading} message="Checking image size..." />

      {/* Alert Modal */}
      <AlertModal
        visible={alertModal.visible}
        message={alertModal.message}
        onClose={hideAlert}
      />

      {/* Picker Modal */}
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
          {/* Info Modal (GIF) */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={globalStyles.modalOverlay}>
              <View style={globalStyles.modalContentContainer}>
                <TouchableOpacity
                  style={globalStyles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={globalStyles.closeButtonText}>X</Text>
                </TouchableOpacity>

                <FastImage
                  source={require("../../assets/gif/FacetoImage.gif")}
                  style={globalStyles.gif}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </View>
            </View>
          </Modal>

          <FeatureLayout
            title="Face To Make Image"
            description="Make Realistic Images Of People Instantly."
            operationId="face-enhancement"
          />

          {/* Tutorial */}
          {!selectedImage && showTutorial && (
            <View style={globalStyles.tutorialContainer}>
              <Text style={globalStyles.tutorialTitle}>{tutorialSteps[0].title}</Text>
              <Text style={globalStyles.tutorialText}>
                {tutorialSteps[0].description}
              </Text>
            </View>
          )}

          {/* Upload Button */}
          {!selectedImage && (
            <Btn title="Upload Image" onPress={() => setPickerVisible(true)} />
          )}

          {/* Selected Image */}
          {selectedImage && (
            <View style={globalStyles.imageWrapper}>
              <Text style={globalStyles.imageLabel}>Selected Image</Text>
              <Image source={{ uri: selectedImage }} style={globalStyles.uploadedImage} />
            </View>
          )}

          {/* Prompt */}
          {selectedImage && (
            <>
              <View style={styles.promptContainer}>
                <Text style={styles.promptLabel}>Enter a Prompt:</Text>
                <TextInput
                  style={styles.promptInput}
                  placeholder="Describe the enhancement..."
                  placeholderTextColor="#aaa"
                  value={prompt}
                  onChangeText={setPrompt}
                />
              </View>

              {prompt.trim() && !processing && !enhancedImage && (
                <Btn title="Generate" onPress={processImage} />
              )}

              {/* Processing */}
              {processing && (
                <View style={styles.processingContainer}>
                  <ActivityIndicator size="large" color="#ffffff" />
                  <Text style={styles.processingText}>Processing...</Text>
                </View>
              )}

              {/* Result */}
              {enhancedImage && Array.isArray(enhancedImage) && (
                <FlatList
                  data={enhancedImage}
                  keyExtractor={(_, index) => index.toString()}
                  renderItem={({ item }) => (
                    <View style={globalStyles.imageWrapper}>
                      <Text style={globalStyles.imageLabel}>Result</Text>
                      <Image source={{ uri: item }} style={globalStyles.uploadedImage} />
                      {downloading ? (
                        <View style={{ marginTop: 10 }}>
                          <ActivityIndicator size="large" color="#ffffff" />
                          <Text style={{ color: "#fff", marginTop: 8 }}>
                            Saving to Downloads...
                          </Text>
                        </View>
                      ) : (
                        <Btn
                          title="Download Image"
                          onPress={() => downloadImage(item)}
                        />
                      )}
                    </View>
                  )}
                  scrollEnabled={false}
                />
              )}
            </>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  uploadedImage: {
    width: 250,
    height: 250,
    borderRadius: 10,
    resizeMode: "contain",
    marginBottom: 20,
  },
  promptContainer: { width: "100%", marginVertical: 10 , paddingHorizontal: 15 },
  promptLabel: { color: "#fff", marginBottom: 5 },
  promptInput: {
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 10,
    color: "#000",
  },
  processingText: { marginTop: 10, color: "#ffffff" },
  processingContainer: { marginTop: 20, alignItems: "center" },
});
