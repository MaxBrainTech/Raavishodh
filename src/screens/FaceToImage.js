import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import FastImage from "react-native-fast-image";
import FeatureLayout from "../component/FeatureLayout";
import RNFS from "react-native-fs";
import axios from "axios";
import { REPLICATE_API_TOKEN } from "@env";
import LinearGradient from "react-native-linear-gradient";
import Btn from "../component/Btn";
import useDownload from "../utils/useDownload";
import useUsageGuard from "../hook/useUsageGuard";
import { checkFileSize } from "../utils/fileUtils";
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

export default function FaceToImage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [enhancedImage, setEnhancedImage] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [loader, setLoader] = useState({ visible: false, message: "" });
  const [alertModal, setAlertModal] = useState({ visible: false, message: "" });
  const [pickerVisible, setPickerVisible] = useState(false);
  const [isModalVisible, setModalVisible] = useState(true);

  const showAlert = (msg) => setAlertModal({ visible: true, message: msg });
  const hideAlert = () => setAlertModal({ visible: false, message: "" });

  const { handleDownload } = useDownload(showAlert, setLoader);
  const { incrementUsage, checkUsage } = useUsageGuard("ai_usage_count");

  // Handle image selection and size check
  const handleImageSelected = async (uri) => {
    setLoader({ visible: true, message: "Checking image size..." });

    const { valid, message } = await checkFileSize(uri, 10);
    setLoader({ visible: false, message: "" });

    if (!valid) {
      showAlert(message);
      return;
    }

    setSelectedImage(uri);
    setEnhancedImage(null);
  };

  const openCamera = async () => {
    setPickerVisible(false);
    const allowed = await checkUsage();
    if (!allowed) return;

    const { launchCamera } = require("react-native-image-picker");
    launchCamera({ mediaType: "photo", quality: 1 }, (response) => {
      if (!response.didCancel && response.assets?.length > 0) {
        handleImageSelected(response.assets[0].uri);
      }
    });
  };

  const openGallery = async () => {
    setPickerVisible(false);
    const allowed = await checkUsage();
    if (!allowed) return;

    const { launchImageLibrary } = require("react-native-image-picker");
    launchImageLibrary({ mediaType: "photo", quality: 1 }, (response) => {
      if (!response.didCancel && response.assets?.length > 0) {
        handleImageSelected(response.assets[0].uri);
      }
    });
  };

  // Process image with Replicate API
  const processImage = async () => {
    if (!selectedImage) {
      showAlert("Please select an image first!");
      return;
    }

    setLoader({ visible: true, message: "Processing image..." });

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
          incrementUsage();
        } else {
          throw new Error("Invalid API response format");
        }
      } else {
        throw new Error(`Processing failed: ${prediction.status}`);
      }
    } catch (error) {
      showAlert(error.message || "Image processing failed");
    }

    setLoader({ visible: false, message: "" });
  };

  return (
    <LinearGradient colors={["#0d1117", "#8ec5fc"]} style={globalStyles.gradient}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={{ alignItems: "center", paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Loader & Alert Modals */}
          <LoaderModal visible={loader.visible} message={loader.message} />
          <AlertModal visible={alertModal.visible} message={alertModal.message} onClose={hideAlert} />

          {/* Picker Modal */}
          <PickerModal
            visible={pickerVisible}
            onCamera={openCamera}
            onGallery={openGallery}
            onClose={() => setPickerVisible(false)}
          />

          {/* Info Modal */}
          {isModalVisible && (
            <Modal animationType="slide" transparent visible={isModalVisible}>
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
          )}

          {/* Feature Header */}
          <FeatureLayout
            title="Face To Make Image"
            description="Make Realistic Images Of People Instantly."
            operationId="face-to-image"
          />

          {/* Tutorial */}
          {!selectedImage && (
            <View style={globalStyles.tutorialContainer}>
              <Text style={globalStyles.tutorialTitle}>{tutorialSteps[0].title}</Text>
              <Text style={globalStyles.tutorialText}>
                {tutorialSteps[0].description}
              </Text>
            </View>
          )}

          {/* Upload Button */}
          {!selectedImage && <Btn title="Upload Image" onPress={() => setPickerVisible(true)} />}

          {/* Selected Image */}
          {selectedImage && (
            <View style={globalStyles.imageWrapper}>
              <Text style={globalStyles.imageLabel}>Selected Image</Text>
              <Image source={{ uri: selectedImage }} style={globalStyles.uploadedImage} />
            </View>
          )}

          {/* Prompt Input */}
          {selectedImage && (
            <View style={styles.promptContainer}>
              <Text style={styles.promptLabel}>Enter a Prompt:</Text>
              <TextInput
                style={styles.promptInput}
                placeholder="Describe the enhancement..."
                placeholderTextColor="#aaa"
                value={prompt}
                onChangeText={setPrompt}
                // blurOnSubmit={false}
                returnKeyType="done"
              />
            </View>
          )}

          {/* Generate Button */}
          {selectedImage && prompt.trim() && !enhancedImage && (
            <Btn title="Generate" onPress={() => processImage()} />
          )}

          {/* Enhanced Result */}
          {enhancedImage && Array.isArray(enhancedImage) && (
            enhancedImage.map((item, index) => (
              <View key={index} style={globalStyles.imageWrapper}>
                <Text style={globalStyles.imageLabel}>Result</Text>
                <Image source={{ uri: item }} style={globalStyles.uploadedImage} />
                <Btn title="Download Image" onPress={() => handleDownload(item, "faceToImage")} />
              </View>
            ))
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  promptContainer: { width: "100%", marginVertical: 10, paddingHorizontal: 15 },
  promptLabel: { color: "#fff", marginBottom: 5 },
  promptInput: {
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 10,
    color: "#000",
  },
});
