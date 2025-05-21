import React, { useState ,useEffect } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Alert, Modal, TouchableOpacity,
  ScrollView,
} from "react-native";
import FastImage from 'react-native-fast-image';
import { launchImageLibrary } from "react-native-image-picker";
import FeatureLayout from "../component/FeatureLayout";
import RNFS from "react-native-fs";
import axios from "axios";
import { REPLICATE_API_TOKEN } from "@env";
import LinearGradient from "react-native-linear-gradient";
import Btn from "../component/Btn";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {auth} from "../services/Firebase";
import { useNavigation } from "@react-navigation/native";

const tutorialSteps = [
  {
    title: "Upload Your Image",
    description:
      "• Click the button below to select an image.\n• Max file size: 10MB.\n• Supported formats: JPEG, PNG, WebP.",
  },
];

export default function FaceToImage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showTutorial, setShowTutorial] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [processing, setProcessing] = useState(false);
  const [enhancedImage, setEnhancedImage] = useState(null);
  const [isModalVisible, setModalVisible] = useState(true);
    const [usageCount, setUsageCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigation = useNavigation();

useEffect(() => {
  const initialize = async () => {
    const storedUsage = await AsyncStorage.getItem("faceToImageUsage");
    const lastUsed = await AsyncStorage.getItem("faceToImageLastUsed");
    const today = new Date().toISOString().split('T')[0];

    if (lastUsed !== today) {
      await AsyncStorage.setItem("faceToImageUsage", "0");
      await AsyncStorage.setItem("faceToImageLastUsed", today);
      setUsageCount(0);
    } else {
      setUsageCount(storedUsage ? parseInt(storedUsage) : 0);
    }

    const currentUser = auth.currentUser;
    setIsLoggedIn(!!currentUser);
  };

  const unsubscribe = auth.onAuthStateChanged(user => {
    setIsLoggedIn(!!user);
  });

  initialize();

  return () => unsubscribe(); // Clean up on unmount
}, []);


 
  const openImagePicker = async () => {
    launchImageLibrary({ mediaType: "photo", quality: 1 }, async (response) => {
      if (!response.didCancel && response.assets?.length > 0) {
        const imageUri = response.assets[0].uri;
        setSelectedImage(imageUri);
        setShowTutorial(false);
      }
    });
  };

 
  const processImage = async () => {
      const limit = isLoggedIn ? 2 : 1;

if (usageCount >= limit) {
  if (!isLoggedIn) {
    Alert.alert(
      "Limit Reached",
      "You’ve used your free try. Login to use one more time today.",
      [
        {
          text: "Login",
          onPress: () => navigation.navigate("Login"),
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  } else {
    Alert.alert("Limit Reached", "You've reached your daily limit. Come back tomorrow!");
  }
  return;
}


    if (!selectedImage) {
      Alert.alert("Error", "Please select an image first!");
      return;
    }

    setProcessing(true);
    try {
      const base64Image = await RNFS.readFile(selectedImage, "base64");

      const response = await axios.post(
        "https://api.replicate.com/v1/predictions",
        {
          version: "43d309c37ab4e62361e5e29b8e9e867fb2dcbcec77ae91206a8d95ac5dd451a0",
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

      // Polling for processing status
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
            const newCount = usageCount + 1;
        setUsageCount(newCount);
        await AsyncStorage.setItem("faceToImageUsage", newCount.toString());
        const today = new Date().toISOString().split("T")[0];
        await AsyncStorage.setItem("faceToImageLastUsed", today);
        } else {
          throw new Error("Invalid API response format");
        }
      } else {
        throw new Error(`Processing failed: ${prediction.status}`);
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Image processing failed");
      console.error("Error processing image:", error);
    }
    setProcessing(false);
  };
  const downloadImage = async (imageUrl) => {
    try {
      const fileName = `enhanced_${Date.now()}.jpg`; 
      const downloadDest = `${RNFS.DownloadDirectoryPath}/${fileName}`;

      const { promise } = RNFS.downloadFile({
        fromUrl: imageUrl,
        toFile: downloadDest,
      });

      await promise;

      Alert.alert("Success", "Image downloaded successfully to Downloads folder!");
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Error", "Failed to download image.");
    }
  };

  return (
    <LinearGradient colors={["#0d1117", "#8ec5fc"]} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
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
                  source={require("../../assets/gif/FacetoImage.gif")}
                  style={styles.gif}
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

          {!selectedImage && showTutorial && (
            <View style={styles.tutorialContainer}>
              <Text style={styles.tutorialTitle}>{tutorialSteps[0].title}</Text>
              <Text style={styles.tutorialText}>{tutorialSteps[0].description}</Text>
            </View>
          )}

          {/* Only show upload button if no image is selected */}
          {!selectedImage && (
            <Btn
              title="Upload Image"
              onPress={openImagePicker}
            >
            </Btn>
          )}

          {/* Show uploaded image */}
          {selectedImage && (
            <View style={styles.imageWrapper}>
              <Image source={{ uri: selectedImage }} style={styles.uploadedImage} />
            </View>
          )}

          {/* Show input field for prompt */}
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
                <Btn title="Generate"
                 onPress={processImage} />
              )}

              {processing && (
                <View style={styles.processingContainer}>
                  <ActivityIndicator size="large" color="#ffffff" />
                  <Text style={styles.processingText}>Processing...</Text>
                </View>
              )}

              {enhancedImage && Array.isArray(enhancedImage) && (
                <FlatList
                  data={enhancedImage}
                  keyExtractor={(_, index) => index.toString()}
                  renderItem={({ item }) => (
                    <View style={styles.imageWrapper}>
                      <Image source={{ uri: item }} style={styles.uploadedImage} />
                      <Btn
                      title="Download"
                        onPress={() => downloadImage(item)}
                      >
                     </Btn>
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
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    // flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
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
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subtitle: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
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
  uploadedImage: {
    width: 250,
    height: 250,
    borderRadius: 10,
    resizeMode: "cover",
    marginBottom: 20,
  },
  processingText: {
    marginTop: 10,
    color: "#ffffff",
  },
  promptContainer: {
    width: "100%",
    marginVertical: 10,
  },
  promptLabel: {
    color: "#fff",
    marginBottom: 5,
  },
  promptInput: {
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 10,
    color: "#000",
  },
  processingContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  imageWrapper: {
    marginVertical: 10,
    alignItems: "center",
  },
});
