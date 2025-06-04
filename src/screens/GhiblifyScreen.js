import React, { useState } from "react";
import {
  View, Text, Image, ActivityIndicator, Alert, StyleSheet, ScrollView, Modal,
  TouchableOpacity, Platform,
} from "react-native";
import FastImage from 'react-native-fast-image';
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import LinearGradient from "react-native-linear-gradient";
import Btn from "../component/Btn";
import axios from "axios";
import RNFS from "react-native-fs";
import { downloadImageFile } from "../utils/downloadImage";
import useUsageGuard from "../hook/useUsageGuard";
import { REPLICATE_API_TOKEN } from "@env";

const tutorialSteps = [
  {
    title: "Upload Your Image",
    description:
      "• Click the button below to select an image.\n• Max file size: 10MB.\n• Supported formats: JPEG, PNG, WebP.",
  }
];

export default function GhiblifyScreen({ navigation }) {
  const [showTutorial, setShowTutorial] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [ghibliImage, setGhibliImage] = useState(null);
  const [isModalVisible, setModalVisible] = useState(true);



const {
  usageCount,
  incrementUsage,
  checkUsage,
} = useUsageGuard("ghibli_usage_count");


  const openImagePicker = () => {
    Alert.alert("Choose an Option", "Select an option to upload an image.", [
      { text: "Camera", onPress: openCamera },
      { text: "Gallery", onPress: openGallery },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const openCamera = async () => {
    if (!checkUsage()) return;
    launchCamera({ mediaType: "photo", quality: 1 }, (response) => {
      if (!response.didCancel && response.assets?.length > 0) {
        handleImageSelected(response.assets[0].uri);
      }
    });
  };

  const openGallery = async () => {
    if (!checkUsage()) return;
    launchImageLibrary({ mediaType: "photo", quality: 1 }, (response) => {
      if (!response.didCancel && response.assets?.length > 0) {
        handleImageSelected(response.assets[0].uri);
      }
    });
  };

  const handleImageSelected = (uri) => {
    setSelectedImage(uri);
    setGhibliImage(null);
    setShowTutorial(false);
  };

  const processGhiblifyImage = async () => {
    if (!selectedImage) {
      Alert.alert("Error", "Please select an image.");
      return;
    }
    if (!checkUsage()) return;

    setProcessing(true);
    try {
      const base64Image = await RNFS.readFile(selectedImage, "base64");

      const response = await axios.post(
        "https://api.replicate.com/v1/predictions",
        {
          version: "b4014c6ade5c1ac4c0d90ee5ea26ee9cf56ad28ee8a705737a0be6cdfdc3ac2a",
          input: {
            image: `data:image/jpeg;base64,${base64Image}`,
            model: "dev",
            prompt: "recreate this image in the style of Ghibli",
            go_fast: false,
            lora_scale: 0.95,
            megapixels: "1",
            num_outputs: 1,
            aspect_ratio: "1:1",
            output_format: "jpg",
            guidance_scale: 3.5,
            output_quality: 100,
            prompt_strength: 0.65,
            extra_lora_scale: 1,
            num_inference_steps: 32,
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

      while (prediction.status === "starting" || prediction.status === "processing") {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const checkResponse = await axios.get(
          `https://api.replicate.com/v1/predictions/${prediction.id}`,
          { headers: { Authorization: `Token ${REPLICATE_API_TOKEN}` } }
        );
        prediction = checkResponse.data;
      }

      if (prediction.status === "succeeded") {
        setGhibliImage(Array.isArray(prediction.output) ? prediction.output[0] : prediction.output);
        await incrementUsage();
      } else {
        throw new Error("Processing failed.");
      }
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to process image.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!ghibliImage) return;

   await downloadImageFile(ghibliImage, "ghibli");

  };


  return (
    <LinearGradient colors={["#0d1117", "#8ec5fc"]} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContentContainer}>
              <TouchableOpacity style={styles.closeButton}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>

              <FastImage
                source={require("../../assets/gif/Ghibli.png")}
                style={styles.gif}
                resizeMode={FastImage.resizeMode.contain}
              />
            </View>
          </View>
        </Modal>
        <View style={styles.container}>
          <Text style={styles.title}>Ghiblify Your Image</Text>
          <Text style={styles.subtitle}>
            Transform your photos into stunning Ghibli-style artwork with AI.
          </Text>

          {!selectedImage && showTutorial && (
            <View style={styles.tutorialContainer}>
              <Text style={styles.tutorialTitle}>{tutorialSteps[0].title}</Text>
              <Text style={styles.tutorialText}>{tutorialSteps[0].description}</Text>
            </View>
          )}

          {!selectedImage ? (
            <Btn
              title="Upload Image" onPress={openImagePicker}>
            </Btn>

          ) : (
            <>
              {selectedImage && (
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.uploadedImage}
                  onError={(e) => {
                    console.log("Selected Image Load Error:", e.nativeEvent.error);
                    Alert.alert("Error", "Could not load selected image.");
                  }}
                />
              )}
              {!ghibliImage && (
                <TouchableOpacity style={styles.button}
                  onPress={processGhiblifyImage} disabled={processing}>
                  <Text style={styles.buttonText}> Generate Ghibli Image</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {processing && (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color="#ffffff" />
              <Text style={styles.processingText}>Processing...</Text>
            </View>
          )}

          {ghibliImage && (
            <>
              <Image
                source={{ uri: ghibliImage }}
                style={styles.generatedImage}
                onError={(e) => {
                  console.log("Ghibli Image Load Error:", e.nativeEvent.error);
                  Alert.alert("Error", "Could not load generated image.");
                }}
              />

              <Btn title="Download Image"
                onPress={handleDownload}>
              </Btn>
            </>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}


const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(70, 71, 77, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
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
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#222',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  gif: {
    width: 260,
    height: 260,
    borderRadius: 20,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subtitle: {
    color: "#fff",
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
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
  tutorialContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,


  },
  tutorialTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  tutorialText: {
    color: "#d1d5db",
    fontSize: 14,
    textAlign: 'left',
    lineHeight: 20,
  },
  uploadedImage: {
    width: 250,
    height: 250,
    borderRadius: 10,
    resizeMode: "contain",
    marginBottom: 20,
  },
  tutorialStep: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    width: "90%",
  },
  tutorialDescription: {
    fontSize: 14,
    color: "black",
    textAlign: "left",
  },
  processingText: {
    marginTop: 10,
    color: "#ffffff"
  },
  generatedImage: {
    width: 250,
    height: 250,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 20,
    resizeMode: "contain",
  },
  processingContainer: {
    alignItems: "center",
    marginTop: 10
  },
});
