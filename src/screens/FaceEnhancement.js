import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Button,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
  Text,
  FlatList,
  KeyboardAvoidingView,
} from "react-native";
import { launchImageLibrary, launchCamera } from "react-native-image-picker";
import { request, PERMISSIONS } from "react-native-permissions";
import FeatureLayout from "../component/FeatureLayout";
import TutorialCarousel from "../component/TutorialCarousel";
import RNFS from "react-native-fs"; // File System for Base64 conversion
import { REPLICATE_API_TOKEN } from '@env';

export default function FaceEnhancement() {
  const [showTutorial, setShowTutorial] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [enhancedImage, setEnhancedImage] = useState(null);
  const [processing, setProcessing] = useState(false);

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
        processImage(response.assets[0].uri);
      }
    });
  };

  const openGallery = async () => {
    await requestPermissions();
    launchImageLibrary({ mediaType: "photo", quality: 1 }, (response) => {
      if (!response.didCancel && response.assets?.length > 0) {
        processImage(response.assets[0].uri);
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
    <KeyboardAvoidingView style={styles.container} behavior="padding">
     
      <View style={{ alignItems: "center", justifyContent: "center"  }}>
        <FeatureLayout
          title="AI Face Enhancement"
          description="Enhance facial features using our advanced AI technology."
          operationId="face-enhancement"
        />

        {!selectedImage && showTutorial && (
          <FlatList
            // nestedScrollEnabled={true}
            data={[{
              title: "Upload Your Image",
              description: "Click on button to select.\nMax file size: 10MB.\nSupported formats: JPEG, PNG, WebP.",
            }]}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.tutorialContainer}>
                <TutorialCarousel steps={[item]} onClose={() => setShowTutorial(false)} />
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
        )}

         {/* Display the uploaded image */}
         {selectedImage && (
    <View style={styles.imageWrapper}>
      <Text style={styles.imageLabel}>Before</Text>
      <Image source={{ uri: selectedImage }} style={styles.uploadedImage} />
    </View>
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
      <Text style={styles.imageLabel}>After</Text>
      <Image source={{ uri: enhancedImage }} style={styles.uploadedImage} />
      <View style={styles.buttonContainer}>
        <Button title="Download Image"
         onPress={downloadImage}
          color="blue" />
      </View>
    </View>
  )}

          {/* Show Upload button only if no image is selected */}
          {!selectedImage && !processing && (
            <View style={styles.buttonContainer}>
              <Button title="Upload Image" 
              onPress={openImagePicker} 
              color="blue" />
            </View>
          )}
      </View>
     
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    backgroundColor: "#5680E9",
  },
  imageWrapper: {
    alignItems: "center",
    marginVertical: 10,
  },
  imageLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 5,
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  tutorialContainer: {
    marginBottom: 10,
    alignItems: "center",
  },
  uploadedImage: {
    width: 200,
    height: 200,
    marginTop: 30,
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
  buttonContainer: {
    marginTop: 20,
    marginBottom: 20,
    width: "50%",
    alignSelf: "center",
  },
});