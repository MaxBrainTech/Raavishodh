import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Button,
  TextInput,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import RNFS from "react-native-fs";
import axios from "axios";
import { REPLICATE_API_TOKEN } from "@env";

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

  // Open image picker
  const openImagePicker = async () => {
    launchImageLibrary({ mediaType: "photo", quality: 1 }, async (response) => {
      if (!response.didCancel && response.assets?.length > 0) {
        const imageUri = response.assets[0].uri;
        setSelectedImage(imageUri);
        setShowTutorial(false);
      }
    });
  };

  // Process image using Replicate API
  const processImage = async () => {
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

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Face To Make Image</Text>
        <Text style={styles.subtitle}>
          Make realistic images of people instantly.
        </Text>

        {!selectedImage && showTutorial && (
          <View style={styles.tutorialContainer}>
            <Text style={styles.tutorialTitle}>{tutorialSteps[0].title}</Text>
            <Text style={styles.tutorialText}>{tutorialSteps[0].description}</Text>
          </View>
        )}

        {/* Only show upload button if no image is selected */}
        {!selectedImage && (
          <Button title="Upload Image" onPress={openImagePicker} color="blue" />
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
              <Button title="Generate" onPress={processImage} color="blue" />
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
                  </View>
                )}
                scrollEnabled={false}
              />
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#5680e9",
    padding: 20,
    alignItems: "center",
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
    textAlign: "center",
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
