import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
  Text, Modal,
  FlatList, TouchableOpacity,
  KeyboardAvoidingView,
} from "react-native";
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary, launchCamera } from "react-native-image-picker";
import { request, PERMISSIONS } from "react-native-permissions";
import FeatureLayout from "../component/FeatureLayout";
import RNFS from "react-native-fs";
import { REPLICATE_API_TOKEN } from '@env';
import LinearGradient from "react-native-linear-gradient";
import Btn from "../component/Btn"

export default function FaceEnhancement() {
  const [showTutorial, setShowTutorial] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [enhancedImage, setEnhancedImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [isModalVisible, setModalVisible] = useState(true);
  const [readyToGenerate, setReadyToGenerate] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigation = useNavigation();

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

  const openCamera = async () => {
    await requestPermissions();
    launchCamera({ mediaType: "photo", quality: 1 }, (response) => {
      if (!response.didCancel && response.assets?.length > 0) {
        setSelectedImage(response.assets[0].uri);
        setEnhancedImage(null);
        setReadyToGenerate(true);
      }
    });
  };

  const openGallery = async () => {
    await requestPermissions();
    launchImageLibrary({ mediaType: "photo", quality: 1 }, (response) => {
      if (!response.didCancel && response.assets?.length > 0) {
        setSelectedImage(response.assets[0].uri);
        setEnhancedImage(null);
        setReadyToGenerate(true);
      }
    });
  };

  const processImage = async (imageUri) => {
    if (!imageUri) return Alert.alert("Error", "No image selected!");
    setProcessing(true);
    setEnhancedImage(null);
    setSelectedImage(imageUri);

    try {
      // Convert image to Base64
      const base64Image = await RNFS.readFile(imageUri, "base64");

      // Replicate API request
      const response = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${REPLICATE_API_TOKEN}`,
        },
        body: JSON.stringify({
          version:
            "0fbacf7afc6c144e5be9767cff80f25aff23e52b0708f17e20f9879b2f21516c",
          input: {
            img: `data:image/jpeg;base64,${base64Image}`, // Send Base64 image
            scale: 2,
            version: "v1.4",
          },
        }),
      });

      const result = await response.json();
      if (result?.error) throw new Error(result.error);

      // Polling until processing is complete
      let prediction = result;
      while (
        prediction.status === "starting" ||
        prediction.status === "processing"
      ) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const checkResponse = await fetch(
          `https://api.replicate.com/v1/predictions/${prediction.id}`,
          {
            headers: { Authorization: `Token ${REPLICATE_API_TOKEN}` },
          }
        );
        prediction = await checkResponse.json();
      }

      if (prediction.status === "succeeded") {
        setEnhancedImage(prediction.output);
        // Alert.alert("Success", "Image enhanced successfully!");
      } else {
        throw new Error(`Failed with status: ${prediction.status}`);
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to enhance image");
      console.error("Enhancement Error:", error);
    } finally {
      setProcessing(false);
    }
  };

  const downloadImage = async () => {
    if (!enhancedImage) return Alert.alert("Error", "No image to download!");
 if (!isLoggedIn) {
     
      navigation.navigate('Login');  
      return;
    }
    try {
      // Request storage permission for Android 10 and below
      if (Platform.OS === "android") {
        const permission = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
        if (permission !== "granted") {
          return Alert.alert("Permission Denied", "Storage permission is required to download images.");
        }
      }

      const fileName = `enhanced_${Date.now()}.jpg`;
      const downloadPath = Platform.OS === "android"
        ? `${RNFS.ExternalStorageDirectoryPath}/Download/${fileName}`
        : `${RNFS.DocumentDirectoryPath}/${fileName}`;


      const downloadResult = await RNFS.downloadFile({
        fromUrl: enhancedImage,
        toFile: downloadPath,
      }).promise;

      if (downloadResult.statusCode === 200) {
        Alert.alert("Download Complete", `Image saved to ${downloadPath}`);
      } else {
        throw new Error("Download failed");
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to download image");
      console.error("Download Error:", error);
    }
  };


  return (
    <LinearGradient colors={["#0d1117", "#8ec5fc"]} style={styles.gradient}>
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <FlatList
          data={[{}]} // dummy data to trigger FlatList
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
                      source={require("../../assets/gif/face_enhancement_tool-gif.gif")}
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

              {/* Display the uploaded image */}
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

              {/* Show processing state */}
              {processing && (
                <View style={styles.processingContainer}>
                  <ActivityIndicator size="large" color="#ffffff" />
                  <Text style={styles.processingText}>Processing...</Text>
                </View>
              )}


              {/* Show enhanced image and Download button */}
              {enhancedImage && (
                <View style={styles.imageWrapper}>
                  <Text style={styles.imageLabel}>Result</Text>
                  <Image source={{ uri: enhancedImage }} style={styles.uploadedImage} />
                  <Btn
                    title="Download Image"
                    onPress={downloadImage}
                  >
                  </Btn>
                </View>
              )}

              {/* Show Upload button only if no image is selected */}
              {!selectedImage && !processing && (
                <Btn
                  title="Upload Image"
                  onPress={openImagePicker}
                >
                </Btn>
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
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  tutorialTitle: {
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  tutorialText: {
    color: "black",
    fontSize: 14,
    textAlign: "left",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(70, 71, 77, 0.85)', // Dark transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentContainer: {
    // width: '85%',
    // backgroundColor: '#fff',
    // borderRadius: 20,
    // padding: 20,
    alignItems: 'center',
    position: 'relative',
    // elevation: 5, 
    shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#000',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    zIndex: 10,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  gif: {
    width: 250,
    height: 250,
    marginTop: 30,
  },
  imageWrapper: {
    alignItems: "center",
    marginVertical: 10,
  },
  imageLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 15,
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },

  uploadedImage: {
    width: 200,
    height: 200,
    marginTop: 0,
    marginBottom: 30,
    borderRadius: 10,
    resizeMode: "cover",
  },
  processingContainer: {
    marginVertical: 10,
    alignItems: "center",
  },
  processingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 5,
  },
});