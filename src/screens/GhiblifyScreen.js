import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Button,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import axios from "axios";
import RNFS from "react-native-fs";
import { REPLICATE_API_TOKEN } from "@env";

const tutorialSteps = [
  {
    title: "Upload Your Image",
    description:
    "• Click the button below to select an image.\n• Max file size: 10MB.\n• Supported formats: JPEG, PNG, WebP.",
  }
];

export default function GhiblifyScreen() {
  const [showTutorial, setShowTutorial] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
   const [image, setImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [ghibliImage, setGhibliImage] = useState(null);

  // Convert Android content:// URI to file path
  const getValidImageUri = async (uri) => {
    if (Platform.OS === "android" && uri.startsWith("content://")) {
      const destPath = `${RNFS.TemporaryDirectoryPath}/temp_image.jpg`;
      await RNFS.copyFile(uri, destPath);
      return destPath;
    }
    return uri;
  };

  // Open image picker
  const openImagePicker = async () => {
    launchImageLibrary({ mediaType: "photo", quality: 1 }, async (response) => {
      if (!response.didCancel && response.assets?.length > 0) {
        const processedUri = await getValidImageUri(response.assets[0].uri);
        if (processedUri) {
          setSelectedImage(processedUri);
        } else {
          Alert.alert("Error", "Invalid image selected. Try again.");
        }
      }
    });
  };

  // Process image using Ghiblify model
  const processGhiblifyImage = async () => {
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
          version:
            "b4014c6ade5c1ac4c0d90ee5ea26ee9cf56ad28ee8a705737a0be6cdfdc3ac2a",
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

      // Polling for processing status
      while (
        prediction.status === "starting" ||
        prediction.status === "processing"
      ) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const checkResponse = await axios.get(
          `https://api.replicate.com/v1/predictions/${prediction.id}`,
          {
            headers: { Authorization: `Token ${REPLICATE_API_TOKEN}` },
          }
        );
        prediction = checkResponse.data;
      }

      // Ensure prediction output is a string URL
      if (prediction.status === "succeeded" && Array.isArray(prediction.output)) {
        setGhibliImage(prediction.output[0]);
      } else if (prediction.status === "succeeded") {
        setGhibliImage(prediction.output);
      } else {
        throw new Error(`Processing failed: ${prediction.status}`);
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Image processing failed");
      console.error("Error processing image:", error);
    }
    setProcessing(false);
  };

  // Function to download image
  const downloadImage = async () => {
    if (!ghibliImage) return;

    try {
      const fileName = `Ghibli_Image_${Date.now()}.jpg`;
      const downloadPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;

      // Download image from URL
      const response = await RNFS.downloadFile({
        fromUrl: ghibliImage,
        toFile: downloadPath,
      }).promise;

      if (response.statusCode === 200) {
        Alert.alert("Success", "Image downloaded successfully!");
      } else {
        throw new Error("Download failed");
      }
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Error", "Failed to download image.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Ghiblify Your Image</Text>
        <Text style={styles.subtitle}>
          Transform your photos into stunning Ghibli-style artwork with AI.
        </Text>

         {!image && showTutorial && (
                    <View style={styles.tutorialContainer}>
                      <Text style={styles.tutorialTitle}>{tutorialSteps[0].title}</Text>
                      <Text style={styles.tutorialText}>{tutorialSteps[0].description}</Text>
                    </View>
                  )}

        {!selectedImage ? (
          <Button title="Upload Image" onPress={openImagePicker} color="blue" />
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
              <Button
                title="Generate Ghibli Image"
                onPress={processGhiblifyImage}
                color="blue"
                disabled={processing}
              />
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
            <Button title="Download Image" 
            onPress={downloadImage} 
            color="blue"
            marginBottom={20}
             />
          </>
        )}
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
    scrollContainer: { 
      flex: 1 
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
      textAlign: 'center',
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
    },
  
    uploadedImage: {
      width: 250,
      height: 250,
      borderRadius: 10,
      resizeMode: "cover",
      marginBottom: 20,
    },
    tutorialStep: {
      backgroundColor: "#fff",
      padding: 10,
      borderRadius: 10,
      marginBottom: 10,
      width: "90%",
    },
    tutorialTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: "black",
      marginBottom: 5,
    },
    tutorialDescription: {
      fontSize: 14,
      color: "black",
      textAlign: "left",
    },
    subtitle:{
      fontSize:16,
      color:"#fff",
      marginBottom:20,
      textAlign:'center'
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
      marginBottom:20
    },
    processingContainer: { 
      alignItems: "center",
       marginTop: 10 
      },
  });
