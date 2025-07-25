import React, { useState } from "react";
import {
  View, Text, Image, StyleSheet,
  FlatList, ActivityIndicator, Alert, Modal, TouchableOpacity
} from "react-native";
import { launchImageLibrary, launchCamera } from "react-native-image-picker";
import FastImage from 'react-native-fast-image';
import FeatureLayout from "../component/FeatureLayout";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation } from '@react-navigation/native';
import RNFS from "react-native-fs";
import { REPLICATE_API_TOKEN } from '@env';
import { downloadImageFile } from "../utils/downloadImage";
import useUsageGuard from "../hook/useUsageGuard";
import Btn from "../component/Btn";

export default function PhotoRestoration() {
  const [showTutorial, setShowTutorial] = useState(true);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);
  const [isModalVisible, setModalVisible] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const navigation = useNavigation();

  const tutorialSteps = [
    {
      title: "Upload Your Image",
      description:
        "\u2022 Click the button below to select an image.\n\u2022 Max file size: 10MB.\n\u2022 Supported formats: JPEG, PNG, WebP.",
    }
  ];

  const {
    usageCount,
    incrementUsage,
    checkUsage,
  } = useUsageGuard("photo_restoration_usage");

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
    setImage(uri);
    setProcessedImage(null);
    setShowTutorial(false);
  };

  const generateNewFeatureImage = async () => {
    if (!image) {
      Alert.alert("Error", "Please select an image first.");
      return;
    }

    setLoading(true);

    try {
      const base64Image = await RNFS.readFile(image, "base64");
      const response = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${REPLICATE_API_TOKEN}`,
        },
        body: JSON.stringify({
          version: "cc4956dd26fa5a7185d5660cc9100fab1b8070a1d1654a8bb5eb6d443b020bb2",
          input: {
            image: `data:image/jpeg;base64,${base64Image}`,
            upscale: 2,
            face_upsample: true,
            background_enhance: true,
            codeformer_fidelity: 0.1
          },
        }),
      });

      const data = await response.json();
      if (data.error || !data.urls?.get) throw new Error(data.error || "Failed to start prediction");

      const resultUrl = await checkReplicateStatus(data.urls.get);
      if (resultUrl) {
        setProcessedImage(resultUrl);
        incrementUsage();
      } else {
        throw new Error("Processing failed with status: failed");
      }
    } catch (error) {
      console.error("Error processing image:", error);
      Alert.alert("Error", error.message || "An error occurred while processing the image.");
    } finally {
      setLoading(false);
    }
  };

  const checkReplicateStatus = async (statusUrl) => {
    try {
      while (true) {
        const response = await fetch(statusUrl, {
          headers: { Authorization: `Token ${REPLICATE_API_TOKEN}` },
        });

        const data = await response.json();

        if (data.status === "succeeded") {
          return data.output;
        } else if (data.status === "failed") {
          return null;
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error("Error checking status:", error);
      return null;
    }
  };

  const downloadImage = async () => {
    if (!processedImage) return;
    try {
      setDownloading(true);
      await downloadImageFile(processedImage, "restored");
    } catch (err) {
      console.error("Download failed", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <LinearGradient colors={["#0d1117", "#8ec5fc"]} style={styles.gradient}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
            <FastImage
              source={require("../../assets/gif/PhotoRestoration.png")}
              style={styles.gif}
              resizeMode={FastImage.resizeMode.contain}
            />
          </View>
        </View>
      </Modal>

      <FlatList
        data={[]}
        keyExtractor={(_, index) => index.toString()}
        ListHeaderComponent={
          <View style={styles.container}>
            <FeatureLayout title="Photo Restoration" description="Restore your Old Photos with AI" />

            {!image && showTutorial && (
              <View style={styles.tutorialContainer}>
                <Text style={styles.tutorialTitle}>{tutorialSteps[0].title}</Text>
                <Text style={styles.tutorialText}>{tutorialSteps[0].description}</Text>
              </View>
            )}

            {!image && <Btn title="Upload Image" onPress={openImagePicker} />}

            {image && (
              <View style={styles.imageWrapper}>
                <Text style={styles.imageLabel}>Selected Image</Text>
                <Image source={{ uri: image }} style={styles.uploadedImage} />
              </View>
            )}

            {image && !processedImage && (
              <View style={styles.button}>
                <Btn title="Generate Image" onPress={generateNewFeatureImage} disabled={loading} />
              </View>
            )}

            {loading && <ActivityIndicator size="large" color="#fff" style={styles.loader} />}

            {processedImage && (
              <View style={styles.imageWrapper}>
                <Text style={styles.imageLabel}>Result</Text>
                <Image source={{ uri: processedImage }} style={styles.uploadedImage} />
                {downloading ? (
                  <View style={{ marginTop: 10 }}>
                    <ActivityIndicator size="large" color="#ffffff" />
                    <Text style={{ color: '#fff', marginTop: 8 }}>Saving to Downloads...</Text>
                  </View>
                ) : (
                  <Btn title="Download Image" onPress={downloadImage} />
                )}
              </View>
            )}
          </View>
        }
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, padding: 10, alignItems: "center" },
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
  },
  closeButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  gif: { width: 260, height: 260, borderRadius: 20 },
  tutorialContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tutorialTitle: { color: "#ffffff", fontSize: 20, fontWeight: "600", marginBottom: 8 },
  tutorialText: { color: "#d1d5db", fontSize: 14, textAlign: 'left', lineHeight: 20 },
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
  imageLabel: { fontSize: 20, fontWeight: "600", color: "#ffffff", marginBottom: 10 },
  uploadedImage: { width: 200, height: 200, marginBottom: 30, borderRadius: 10, resizeMode: "contain" },
  button: { marginVertical: 10 },
  loader: { marginTop: 10 },
});
