import React, { useState } from "react";
import {
  View, StyleSheet, Image, Platform, Text,
  Modal, FlatList, TouchableOpacity, KeyboardAvoidingView, ActivityIndicator
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

/** Premium Loader Modal **/
const LoaderModal = ({ visible, message }) => {
  if (!visible) return null;
  return (
    <Modal transparent animationType="fade">
      <View style={styles.loaderOverlay}>
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loaderText}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

/** Premium Alert Modal **/
const AlertModal = ({ visible, message, onClose }) => {
  if (!visible) return null;
  return (
    <Modal transparent animationType="fade">
      <View style={styles.loaderOverlay}>
        <View style={styles.alertBox}>
          <Text style={styles.alertText}>{message}</Text>
          <TouchableOpacity style={styles.alertButton} onPress={onClose}>
            <Text style={styles.alertButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

/** Dark Picker Modal (Camera/Gallery) **/
const PickerModal = ({ visible, onCamera, onGallery, onClose }) => {
  if (!visible) return null;
  return (
    <Modal transparent animationType="fade">
      <View style={styles.loaderOverlay}>
        <View style={styles.alertBox}>
          <Text style={[styles.alertText, { marginBottom: 20 }]}>
            Select an option to upload an image
          </Text>
          <View style={{ flexDirection: "row", gap: 20 }}>
            <TouchableOpacity style={styles.alertButton} onPress={onCamera}>
              <Text style={styles.alertButtonText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.alertButton} onPress={onGallery}>
              <Text style={styles.alertButtonText}>Gallery</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[styles.alertButton, { marginTop: 15, backgroundColor: "#444" }]} onPress={onClose}>
            <Text style={[styles.alertButtonText, { color: "#fff" }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function FaceEnhancement() {
  const [showTutorial, setShowTutorial] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [enhancedImage, setEnhancedImage] = useState(null);
  const [isModalVisible, setModalVisible] = useState(true);
  const [readyToGenerate, setReadyToGenerate] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Unified loader state
  const [loader, setLoader] = useState({ visible: false, message: "" });

  // Unified alert state
  const [alertModal, setAlertModal] = useState({ visible: false, message: "" });
  const showAlert = (msg) => setAlertModal({ visible: true, message: msg });
  const hideAlert = () => setAlertModal({ visible: false, message: "" });

  // Picker modal
  const [pickerVisible, setPickerVisible] = useState(false);

  const navigation = useNavigation();

  const {
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
    setPickerVisible(true);
  };

  const handleImageSelected = async (uri) => {
    try {
      setLoader({ visible: true, message: "Checking image size..." });

      const fileStats = await RNFS.stat(uri);
      const fileSizeMB = fileStats.size / (1024 * 1024);

      setLoader({ visible: false, message: "" });

      if (fileSizeMB >= 10) {
        showAlert("Image size exceeds 10 MB. Please upload a smaller image.");
        return;
      }

      setSelectedImage(uri);
      setEnhancedImage(null);
      setReadyToGenerate(true);
    } catch (err) {
      setLoader({ visible: false, message: "" });
      showAlert("Could not check file size. Please try again.");
    }
  };

  const openCamera = async () => {
    setPickerVisible(false);
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
    setPickerVisible(false);
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
    if (!imageUri) return showAlert("No image selected!");

    setLoader({ visible: true, message: "Enhancing image..." });
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
        if (prediction.error?.includes("cog: got error trying to upload output files")) {
          showAlert("This image seems already enhanced. Try another one.");
        } else {
          showAlert("Image enhancement failed. Please try again.");
        }
      }
    } catch (err) {
      showAlert(err.message || "Failed to enhance image");
    } finally {
      setLoader({ visible: false, message: "" });
    }
  };

  const downloadImage = async () => {
    if (!enhancedImage) return;
    try {
      setDownloading(true);
      await downloadImageFile(enhancedImage, "enhanced");
    } catch (err) {
      showAlert("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <LinearGradient colors={["#0d1117", "#8ec5fc"]} style={styles.gradient}>
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        {/* Loader */}
        <LoaderModal visible={loader.visible} message={loader.message} />

        {/* Alerts */}
        <AlertModal
          visible={alertModal.visible}
          message={alertModal.message}
          onClose={hideAlert}
        />

        {/* Picker */}
        <PickerModal
          visible={pickerVisible}
          onCamera={openCamera}
          onGallery={openGallery}
          onClose={() => setPickerVisible(false)}
        />

        <FlatList
          data={[{}]}
          keyExtractor={(_, index) => index.toString()}
          renderItem={() => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              {/* Tutorial GIF Modal */}
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

              {selectedImage && !readyToGenerate && enhancedImage && (
                <View style={styles.imageWrapper}>
                  <Text style={styles.imageLabel}>Result</Text>
                  <Image
                    source={{ uri: enhancedImage }}
                    style={styles.uploadedImage}
                    onLoadStart={() =>
                      setLoader({ visible: true, message: "Loading result..." })
                    }
                    onLoadEnd={() =>
                      setLoader({ visible: false, message: "" })
                    }
                  />

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

              {selectedImage && !enhancedImage && readyToGenerate && (
                <Btn
                  title="Enhance"
                  onPress={() => {
                    setReadyToGenerate(false);
                    processImage(selectedImage);
                  }}
                />
              )}

              {!selectedImage && (
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
  loaderOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  loaderBox: {
    backgroundColor: "#1f2937",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  loaderText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
  alertBox: {
    backgroundColor: "#1f2937",
    padding: 25,
    borderRadius: 20,
    width: "75%",
    alignItems: "center",
  },
  alertText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  alertButton: {
    backgroundColor: "#8ec5fc",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  alertButtonText: {
    color: "#000",
    fontWeight: "600",
  },
});
