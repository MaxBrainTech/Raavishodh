import React, { useState } from "react";
import {
  View, StyleSheet, Image, Alert, Platform, ActivityIndicator, Text,
  Modal, FlatList, TouchableOpacity, KeyboardAvoidingView,
} from "react-native";
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary, launchCamera } from "react-native-image-picker";
import { request, PERMISSIONS } from "react-native-permissions";
import FeatureLayout from "../component/FeatureLayout";
import RNFS from "react-native-fs";
import { REPLICATE_API_TOKEN } from '@env';
import LinearGradient from "react-native-linear-gradient";
import Btn from "../component/Btn";
import useUsageGuard from "../hook/useUsageGuard";
import { downloadImageFile } from '../utils/downloadImage';

export default function FaceEnhancement() {
  const [showTutorial, setShowTutorial] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [enhancedImage, setEnhancedImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [isModalVisible, setModalVisible] = useState(true);
  const [readyToGenerate, setReadyToGenerate] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const navigation = useNavigation();

  const {
    usageCount,
    incrementUsage,
    checkUsage,
  } = useUsageGuard("ghibli_usage_count");

  const tutorialSteps = [
    {
      title: "Upload Your Image",
      description:
        "• Click the button below to select an image.\n• Max file size: 10MB.\n• Supported formats: JPEG, PNG, WebP.",
    },
  ];

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      await request(PERMISSIONS.ANDROID.CAMERA);
      await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
    } else {
      await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
      await request(PERMISSIONS.IOS.CAMERA);
    }
  };

  const openImagePicker = () => {
    Alert.alert("Choose an Option", "Select an option to upload an image.", [
      { text: "Camera", onPress: openCamera },
      { text: "Gallery", onPress: openGallery },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleImageSelected = (uri) => {
    setSelectedImage(uri);
    setEnhancedImage(null);
    setReadyToGenerate(true);
  };


  const openCamera = async () => {
    await requestPermissions();
    const allowed = await checkUsage();
    if (!allowed) return;

    launchCamera({ mediaType: "photo", quality: 1 }, (response) => {
      if (!response.didCancel && response.assets?.length > 0) {
        handleImageSelected(response.assets[0].uri);
      }
    });
  };

  const openGallery = async () => {
    await requestPermissions();
    const allowed = await checkUsage();
    if (!allowed) return;

    launchImageLibrary({ mediaType: "photo", quality: 1 }, (response) => {
      if (!response.didCancel && response.assets?.length > 0) {
        handleImageSelected(response.assets[0].uri);
      }
    });
  };

  const processImage = async (imageUri) => {
    if (!imageUri) return Alert.alert("Error", "No image selected!");

    setProcessing(true);
    setEnhancedImage(null);

    try {
      const base64Image = await RNFS.readFile(imageUri, "base64");

      const response = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${REPLICATE_API_TOKEN}`,
        },
        body: JSON.stringify({
          version: "0fbacf7afc6c144e5be9767cff80f25aff23e52b0708f17e20f9879b2f21516c",
          input: {
            img: `data:image/jpeg;base64,${base64Image}`,
            scale: 2,
            version: "v1.4",
          },
        }),
      });

      let prediction = await response.json();
      if (prediction?.error) throw new Error(prediction.error);

      while (
        prediction.status === "starting" ||
        prediction.status === "processing"
      ) {
        await new Promise((res) => setTimeout(res, 3000));
        const pollRes = await fetch(
          `https://api.replicate.com/v1/predictions/${prediction.id}`,
          {
            headers: { Authorization: `Token ${REPLICATE_API_TOKEN}` },
          }
        );
        prediction = await pollRes.json();
      }

      if (prediction.status === "succeeded") {
        setEnhancedImage(prediction.output);
        incrementUsage();
      } else {
        throw new Error("Image enhancement failed.");
      }
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to enhance image");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const downloadImage = async () => {
    if (!enhancedImage) return;

    try {
      setDownloading(true);
      await downloadImageFile(enhancedImage, "enhanced");
    } catch (err) {
      console.error("Download failed", err);
    } finally {
      setDownloading(false);
    }
  };


  return (
    <LinearGradient colors={["#0d1117", "#8ec5fc"]} style={styles.gradient}>
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <FlatList
          data={[{}]}
          keyExtractor={(_, index) => index.toString()}
          renderItem={() => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>

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
                      source={require("../../assets/gif/face_enhancement_tool-gif.png")}
                      style={styles.gif}
                      resizeMode={FastImage.resizeMode.contain}
                    />
                  </View>
                </View>
              </Modal>
              <FeatureLayout
                title="AI Face Enhancement"
                description="Enhance facial features using our advanced AI technology."
                operationId="face-enhancement"
              />

              {!selectedImage && showTutorial && (
                <View style={styles.tutorialContainer}>
                  <Text style={styles.tutorialTitle}>{tutorialSteps[0].title}</Text>
                  <Text style={styles.tutorialText}>{tutorialSteps[0].description}</Text>
                </View>
              )}

              {selectedImage && (
                <View style={styles.imageWrapper}>
                  <Text style={styles.imageLabel}>Selected Image</Text>
                  <Image source={{ uri: selectedImage }} style={styles.uploadedImage} />
                </View>
              )}
              {selectedImage && !processing && readyToGenerate && (
                <Btn
                  title="Generate"
                  onPress={() => {
                    setReadyToGenerate(false);
                    processImage(selectedImage);
                  }}
                />
              )}

              {processing && (
                <View style={styles.processingContainer}>
                  <ActivityIndicator size="large" color="#ffffff" />
                  <Text style={styles.processingText}>Processing...</Text>
                </View>
              )}

              {enhancedImage && (
                <View style={styles.imageWrapper}>
                  <Text style={styles.imageLabel}>Result</Text>
                  <Image source={{ uri: enhancedImage }} style={styles.uploadedImage} />
                  {downloading ? (
                    <View style={{ marginTop: 10 }}>
                      <ActivityIndicator size="large" color="#ffffff" />
                      <Text style={{ color: '#fff', marginTop: 8 }}>Saving to Downloads...</Text>
                    </View>
                  ) : (
                    <Btn
                      title="Download Image"
                      onPress={downloadImage}
                    />
                  )}

                </View>
              )}

              {!selectedImage && !processing && (
                <Btn
                  title="Upload Image"
                  onPress={openImagePicker}
                />
              )}
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
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
  imageWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 20,
    marginVertical: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    width: '85%',
  },
  imageLabel: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 10,
  },
  uploadedImage: {
    width: 200,
    height: 200,
    marginTop: 0,
    marginBottom: 30,
    borderRadius: 10,
    resizeMode: "contain",
  },
  processingContainer: {
    marginVertical: 10,
    alignItems: "center",
  },
  processingText: {
    color: "#fff",
    fontSize: 16,
    fontStyle: "italic",
    marginTop: 10,
  },
});